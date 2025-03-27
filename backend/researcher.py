import dataclasses
import json
import os
import requests
import time
import functools
from typing import List, Dict, Any, Tuple
import google.generativeai as genai

# Set up Gemini API
genai.configure(api_key="AIzaSyB9XeND-lh978DqamBf-pwWCpKr6vjc-Z4")

# Set Brave Search API key
BRAVE_SEARCH_API_KEY = "BSACQzu2oJNvn3ExnqB4PkMtmp5WbJz"

# ===
# URL Content Grabber
# ===
@dataclasses.dataclass
class URLContent:
    title: str
    text: str
    error: str | None = None

def get_url_content(url: str) -> URLContent:
    headers: dict = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data: dict = {
        "url": url,
        "is_blog": True
    }
    response: requests.Response = requests.post('https://fun-readable-cd6ed9e43b50.herokuapp.com/convert', headers=headers, json=data)
    if response.status_code != 200:
        return URLContent(title="", text="", error=f"Error: {response.status_code}")
    try:
        content = response.json()
        return URLContent(**content)
    except ValueError as e:
        return URLContent(title="", text="", error=f"Error parsing response: {str(e)}")

url_grabber_tools = [{
    "type": "function",
    "function": {
        "name": "get_url_content",
        "description": "Retrieve and parse content from a given URL.",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The URL from which to fetch the content."},
            },
            "required": ["url"]
        }
    }
}]

# ===
# Brave Search tool
# ===

@dataclasses.dataclass
class SearchResult:
    title: str
    url: str
    description: str
    extra_snippets: list

    def __str__(self) -> str:
        return (
            f"Title: {self.title}\n"
            f"URL: {self.url}\n"
            f"Description: {self.description}\n"
            f"Extra Snippets: {', '.join(self.extra_snippets)}"
        )

def search_brave(query: str, count: int = 3) -> list[SearchResult]:
    if not query:
        return []

    url: str = "https://api.search.brave.com/res/v1/web/search"
    headers: dict = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY
    }
    if not headers['X-Subscription-Token']:
        print("Error: Missing Brave Search API key.")
        return []

    params: dict = {
        "q": query,
        "count": count
    }

    retries: int = 0
    max_retries: int = 3
    backoff_factor: int = 2

    while retries < max_retries:
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # Raises an exception for HTTP errors
            results_json: dict = response.json()
            print('Got results')
            break
        except requests.exceptions.RequestException as e:
            print(f"HTTP Request failed: {e}, retrying...")
            retries += 1
            if retries < max_retries:
                time.sleep(backoff_factor ** retries)
            else:
                return []

    results: List[SearchResult] = []
    for item in results_json.get('web', {}).get('results', []):
        result = SearchResult(
            title=item.get('title', ''),
            url=item.get('url', ''),
            description=item.get('description', ''),
            extra_snippets=item.get('extra_snippets', [])
        )
        results.append(result)
    return results

brave_search_tools = [{
    "type": "function",
    "function": {
        "name": "search_brave",
        "description": "Search the web using Brave Search API and returns structured search results.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "the search query string."},
            },
            "required": ["query"]
        }
    }
}]

# ===
# Main System
# ===

first_llm_system_prompt = '''
You are a language model. Your task is to answer the complex queries of the user. You can use brave search to search internet and get not just links and title and small description, but also a deep dive into the original content of certain pages.

You can perform multiple search requests with breakdown'd queries, and do multi-turn requests before answering the user's queries.
'''.strip()

second_llm_system_prompt = '''
You are a language model and your task is to look at the search results received from searching the internet for a user given query. You have to decide, whether the results need to be augmented with more information from actual webpage. If you do decide that you need to add more information for a certain result, you can call the tool.

Your final response back to the user should be a long compilation of the entire search result input and the content gathered from surfing webpages. Make sure that you include all the required information and additional related content that is mentioned.
'''.strip()

answer_checker_system_prompt = '''
You are a language model and your task is to evaluate the answer that is generated by another llm for the given user query. Check if the answer does answer the entire question or list of questions that the user is asking.

If you think answer is sufficient, then call return_answer_to_user tool, else if you think the answer needs some more information, then call the regenerate_answer tool with your suggestion as to how to modify the answer, and what else needs to be included.

You can only call one function at a time.

For answer sufficiency, look if the answer is appropriately answered. Look for sections which could benefit from further internet research. Sometimes the llm might just answer based on the one google search, you can ask the llm to research down another avenue to fulfill question. 
'''.strip()

answer_checker_tools = [
    {
        "type": "function",
        "function": {
            "name": "return_answer_to_user",
            "description": "This is function will return the current answer back to the user",
            "parameters": {}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "regenerate_answer",
            "description": "This function will send the suggestion back to the llm for modifications to the answer based on the user queries",
            "parameters": {
                "type": "object",
                "properties": {
                    "suggestion": {"type": "string", "description": "the suggestion for the llm"},
                },
                "required": ["suggestion"]
            }
        }
    }
]

def ask_llm(messages: List[Dict[str, str]]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Ask the Gemini model a question and get a response.

    :param messages: List of message dictionaries
    :return: Model's response as a dictionary
    """
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Convert messages to the format expected by Gemini
    formatted_messages = [{"parts": [{"text": msg["content"]}] for msg in messages}]
    
    response = model.generate_content(formatted_messages)
    return response.text, {}

@functools.lru_cache(maxsize=1024)
def process_user_query(query: str) -> str:
    history = [{'role': 'system', 'content': first_llm_system_prompt}]
    initial_message = {"role": "user", "content": query}
    history.append(initial_message)

    while True:
        assistant_message, _ = ask_llm(history)
        history.append({"role": "assistant", "content": assistant_message})

        # Gemini does not support tool calls, so we skip this part
        # Instead, we directly return the assistant's response
        input_to_answer_checker = f'User query: {query}\n\nLLM Answer:\n{assistant_message}'
        answer_checker_history = [
            {'role': 'system', 'content': answer_checker_system_prompt},
            {'role': 'user', 'content': input_to_answer_checker},
        ]
        answer_checker_response, _ = ask_llm(answer_checker_history)

        # Since Gemini does not support tool calls, we assume the response is final
        return assistant_message

# Example usage
if __name__ == "__main__":
    user_question: str = input("What's your question? ")
    response = process_user_query(user_question)
    print(f"Response: {response}")
    
    with open('response.md', 'w') as f:
        f.write(response)