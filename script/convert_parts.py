import sys
import json
import csv

if len(sys.argv) < 2:
    print("usage: python convert_parts.py parts.json")
    exit(1)
    
with open(sys.argv[1], 'r', encoding='utf-8') as fp:
    parts = json.load(fp)
    with open('output.csv', 'w', encoding='utf-8', newline='') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        csv_writer.writerow(['position', 'name', 'lab name', 'category', 'sub category', 'comment', 'sequence'])
        for pos_parts in parts:
            for part in pos_parts['parts']:
                csv_writer.writerow([part['position'], part['name'], part['labName'], part['category'], part['subCategory'], part['comment'], part['sequence']])

print('done')