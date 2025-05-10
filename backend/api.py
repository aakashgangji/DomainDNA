from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import main

app = FastAPI()

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

import os

# Set up Gemini API key
os.environ["GEMINI_API_KEY"] = #XXX

# Models

class ProductNameRequest(BaseModel):
    description: str

class ProductNameResponse(BaseModel):
    product_name: str

class DomainNameRequest(BaseModel):
    product_name: str

class DomainNameResponse(BaseModel):
    domain_name: str
    available: bool

class DomainResearchRequest(BaseModel):
    domain_name: str
    need_detailed_report: bool = True

class IllegalActivityResponse(BaseModel):
    illegal_activity: bool
    details: Optional[str] = None

class DomainOfferingResponse(BaseModel):
    domain_name: str
    use_case: list[str]

class DomainAvailabilityRequest(BaseModel):
    domain_name: str

class DomainAvailabilityResponse(BaseModel):
    available: bool

# Example in-memory data (for demonstration purposes)
# Replace this with actual logic or database calls
product_name_suggestions = ["SmartHome Pro", "EcoClean 3000", "TechGenius", "EcoWear"]
domain_name_suggestions = [
    {"domain_name": "smarthomepro.com", "available": True},
    {"domain_name": "ecoclean3000.net", "available": False}
]
domain_research = {
    "smarthomepro.com": {
        "illegal_activity": False,
        "use_case": "Home automation products."
    },
    "ecoclean3000.net": {
        "illegal_activity": True,
        "details": "Domain was previously used in phishing scams.",
        "use_case": "Eco-friendly cleaning services."
    }
}

# API Endpoints

@app.post("/product-names", response_model=List[ProductNameResponse])
async def suggest_product_names(request: ProductNameRequest):
    return [{'product_name': x} for x in main.get_product_names(request.description)]

@app.post("/domain-names", response_model=List[DomainNameResponse])
async def suggest_domain_names(request: DomainNameRequest):
    domain_names = main.get_domain_names(request.product_name)
    ret = [dict(domain_name=x, available=main.is_domain_available_for_purchase(x)) for x in domain_names]
    return ret

@app.post("/domain-research/illegal-activity", response_model=IllegalActivityResponse)
async def check_illegal_activity(request: DomainResearchRequest):
    return main.research_for_illegal_activities(request.domain_name, request.need_detailed_report)

@app.post("/domain-research/offering", response_model=DomainOfferingResponse)
async def check_domain_offering(request: DomainResearchRequest):
    return main.research_for_product_offerings(request.domain_name)

@app.post("/domain-availability", response_model=DomainAvailabilityResponse)
async def check_domain_availability(request: DomainAvailabilityRequest):
    return DomainAvailabilityResponse(available=main.is_domain_available_for_purchase(request.domain_name))
