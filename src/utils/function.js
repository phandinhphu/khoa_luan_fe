function xorDecode(arr, key) {
    return arr.map(b => b ^ key);
}

export { xorDecode };