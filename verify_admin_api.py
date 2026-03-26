import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_flow():
    # 1. Login
    print("Attempting login...")
    login_data = {"email": "testuser_unique@example.com", "password": "password123"}
    response = requests.post(f"{BASE_URL}/users/login/", json=login_data)
    
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        return
    
    user_info = response.json()
    token = user_info['token']
    is_admin = user_info.get('isAdmin', False)
    print(f"Logged in. isAdmin: {is_admin}")
    
    if not is_admin:
        print("User is not an admin. Backend promotion might have failed or cache issues.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update Product
    print("Testing product update...")
    product_id = 1
    update_data = {
        "name": "ZNZY LUXURY - Juliet Mini Dress",
        "price": "7500.00",
        "description": "Updated via verification script."
    }
    response = requests.put(f"{BASE_URL}/products/update/{product_id}/", json=update_data, headers=headers)
    if response.status_code == 200:
        print("Product update successful!")
        print(response.json())
    else:
        print(f"Product update failed: {response.status_code} - {response.text}")

    # 3. Test Image Upload
    print("Testing image upload...")
    # Create a dummy image file
    with open("dummy.jpg", "wb") as f:
        f.write(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00\xFF\xDB\x00\x43...") 
    
    files = {'image': open('dummy.jpg', 'rb')}
    data = {'product_id': product_id}
    response = requests.post(f"{BASE_URL}/products/upload/", files=files, data=data, headers=headers)
    
    if response.status_code == 201 or response.status_code == 200:
        print("Image upload successful!")
        print(response.json())
    else:
        print(f"Image upload failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_admin_flow()
