#!/bin/bash

# Define your JSON file here
JSON_FILE="modern_skins.json"

# Define extraction directories
TEMP_DIR="temp_maki"
FINAL_DIR="extracted_maki"

mkdir -p $TEMP_DIR
mkdir -p $FINAL_DIR

# Function to download a file and extract .maki files
process_url() {
    json_node=$(echo "${1}" | base64 --decode)

    url=$(echo "${json_node}" | jq -r '.download_url')
    file=$(echo "${json_node}" | jq -r '.filename')

    echo "Downloading $url..."
    # Use wget to download the file
    wget -O $file $url

    echo "Extracting .maki files from $file..."
    # Use unzip to extract .maki files to a temporary directory
    unzip -j -o $file "*.maki" -d $TEMP_DIR

    # Extract the MD5 hash from the download URL
    skin_md5_hash=$(basename $url | cut -d '.' -f1)
    
    # Move the files from temporary directory to the final directory with unique names
    for extracted_file in $TEMP_DIR/*.maki; do
        base_file=$(basename "$extracted_file")
        file_md5_hash=$(md5sum "$extracted_file" | awk '{ print $1 }')
        mv "$extracted_file" "$FINAL_DIR/${base_file%.*}_${skin_md5_hash}_${file_md5_hash}.maki"
    done

    # Remove the downloaded zip file
    rm $file
    rm -r $TEMP_DIR
}

export -f process_url
export TEMP_DIR
export FINAL_DIR

# Run the function in parallel
jq -r '.data.modern_skins.nodes[] | @base64' $JSON_FILE | parallel -j 10 process_url

echo "Download and extraction completed."