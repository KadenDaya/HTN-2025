import requests

class ZillowAPI:
    def __init__(self, api_key: str):
        self.base_url = "https://zillow-com1.p.rapidapi.com"
        self.headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": "zillow-com1.p.rapidapi.com"
        }

    def search_homes(self, location, downpayment, leverage=5):
        """
        Search homes by location and downpayment.
        Post-filters results to enforce:
          - Price in range
          - Must be in requested city
          - Must have an image
          - Top 5 by square footage
        """
        price = downpayment * leverage
        min_price = int(price * 0.9)
        max_price = int(price * 1.1)

        url = f"{self.base_url}/propertyExtendedSearch"
        params = {
            "location": location,
            "status_type": "ForSale",
            "price_min": min_price,
            "price_max": max_price
        }

        resp = requests.get(url, headers=self.headers, params=params)
        resp.raise_for_status()
        data = resp.json()

        props = data.get("props", [])

        # 🔎 Post-filter
        filtered = []
        for home in props:
            price = home.get("price")
            address = home.get("address", "").lower()
            images = home.get("imgSrc") or home.get("hdpData", {}).get("homeInfo", {}).get("imgSrc")

            if (
                price is not None and min_price <= price <= max_price
                and location.split(",")[0].strip().lower() in address  # city must match
                and images  # must have at least one image
            ):
                filtered.append(home)

        # 📏 Sort by square footage (descending) & keep top 5
        filtered = sorted(filtered, key=lambda x: x.get("livingArea") or 0, reverse=True)[:3]

        return filtered

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.getenv("ZILLOW_API_KEY")
    zillow = ZillowAPI(api_key=api_key)

    results = zillow.search_homes("Waterloo, ON", 250000)
    print(results)