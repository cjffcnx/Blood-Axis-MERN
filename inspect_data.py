from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from bson import ObjectId

# Load env from repo root (one level up from /blood)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
load_dotenv(os.path.join(project_root, ".env"))

mongo_url = os.getenv("MONGO_URL") or os.getenv("MONGODB_URI")
if not mongo_url:
    raise ValueError("Missing MONGO_URL or MONGODB_URI in environment")

client = MongoClient(mongo_url)
# List databases to see where 'inventories' is
print(f"Connected to Atlas")
dbs = client.list_database_names()
print(f"Databases: {dbs}")

# Check 'test' and 'blood_bank'
possible_dbs = ['test', 'blood_bank']
db_name = None
for name in possible_dbs:
    if name in dbs:
        db = client[name]
        cols = db.list_collection_names()
        if 'inventories' in cols or 'inventory' in cols:
            print(f"Found collections in '{name}': {cols}")
            db_name = name
            break

if not db_name:
    print("Could not find database with inventory collection!")
    # Just pick the first non-system one
    for name in dbs:
        if name not in ['admin', 'local']:
            db_name = name
            print(f"Defaulting to '{name}'")
            break

db = client[db_name]
print(f"Using database: {db_name}")

# Check if 'inventory' collection exists
if 'inventory' not in db.list_collection_names():
    print("Collection 'inventory' not found!")
    # Try singular?
    if 'inventories' in db.list_collection_names():
        print("Found 'inventories' instead!")
        db_coll = db['inventories']
    else:
        print("Available collections:", db.list_collection_names())
        exit()
else:
    db_coll = db['inventory']

org_id_str = "6922ae4a3dae846e73b5a839"
org_id_obj = ObjectId(org_id_str)

print(f"\nSearching for Org ID: {org_id_str}")

# Check count with string
count_str = db_coll.count_documents({'organisation': org_id_str})
print(f"Count with String ID: {count_str}")

# Check count with ObjectId
count_obj = db_coll.count_documents({'organisation': org_id_obj})
print(f"Count with ObjectId: {count_obj}")

# Check count with 'out'
count_out = db_coll.count_documents({'organisation': org_id_obj, 'inventoryType': 'out'})
print(f"Count with ObjectId + OUT: {count_out}")

# Print sample record
sample = db_coll.find_one({'organisation': org_id_obj})
if sample:
    print("\nSample Record:")
    print(sample)
    print(f"Organisation Type: {type(sample.get('organisation'))}")
    print(f"Date Type: {type(sample.get('createdAt'))}")
else:
    print("\nNo sample record found with ObjectId match.")
