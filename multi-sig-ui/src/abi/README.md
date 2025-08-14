# ABI Files

This directory contains ABI (Application Binary Interface) files for smart contracts used by the multisig UI.

## Setup Instructions

1. **Copy your contract ABI**: After deploying your multisig contract, copy the ABI from your contract compilation artifacts to this directory.

2. **File naming**: Save your ABI file as `SimpleERC20Multisig.json` (without the `.example` suffix).

3. **Source location**: You can find the ABI in your contract compilation output, typically at:
   ```
   multi-sig/out/SimpleERC20Multisig.sol/SimpleERC20Multisig.json
   ```

4. **Copy command example**:
   ```bash
   # From the project root
   cp multi-sig/out/SimpleERC20Multisig.sol/SimpleERC20Multisig.json multi-sig-ui/src/abi/SimpleERC20Multisig.json
   ```

## File Structure

- `SimpleERC20Multisig.example.json` - Example ABI file (for reference)
- `SimpleERC20Multisig.json` - Your actual ABI file (you need to copy this)
- `README.md` - This documentation

## Important Notes

- The actual ABI file (`SimpleERC20Multisig.json`) is gitignored to avoid committing deployed contract details
- Make sure to update your ABI file whenever you modify and redeploy your contract
- The example file shows the expected structure and can be used as a reference
