# Counter DApp Setup Guide

## Project Structure
```
counter-dapp/
├── .env                    # Environment variables
├── smart-contracts/        # Hardhat project
│   ├── contracts/
│   │   └── Counter.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── hardhat.config.ts
│   └── package.json
└── frontend/              # Vite + React project
    ├── src/
    │   ├── artifacts/     # Contract artifacts
    │   ├── components/
    │   │   └── Counter.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env
    └── package.json
```

## Step 1: Create Hardhat Project

```bash
mkdir counter-dapp
cd counter-dapp
mkdir smart-contracts
cd smart-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node @types/node @types/mocha
npx hardhat init
```

Create Counter.sol in contracts/:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 private _count;
    
    event CountChanged(uint256 newCount);
    
    constructor(uint256 initialCount) {
        _count = initialCount;
    }
    
    function increment() public {
        _count += 1;
        emit CountChanged(_count);
    }
    
    function decrement() public {
        require(_count > 0, "Counter: cannot decrement below zero");
        _count -= 1;
        emit CountChanged(_count);
    }
    
    function getCount() public view returns (uint256) {
        return _count;
    }
}
```

Update hardhat.config.ts:
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // Built-in hardhat network
    hardhat: {
      chainId: 1337
    },
    // Local network when you run `npx hardhat node`
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;

```

Create deploy script in scripts/deploy.ts:
```typescript
import { ethers } from "hardhat";

async function main() {
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy(0);
  await counter.waitForDeployment();

  console.log("Counter deployed to:", await counter.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## Step 2: Create Vite Frontend

```bash
cd ..
npm create vite@5 frontend -- --template react-ts
cd frontend
npm install
npm install ethers@6.8.1
```

Create .env in frontend/:
```plaintext
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

Create Counter component in src/components/Counter.tsx:
```typescript
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import CounterArtifact from '../../../smart-contracts/artifacts/contracts/Counter.sol/Counter.json'

const COUNTER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

const Counter = () => {
  const [count, setCount] = useState<number>(0)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum === 'undefined') {
        setError('Please install MetaMask!')
        return
      }

      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        console.log('Provider:', provider)

        const signer = await provider.getSigner()
        console.log('Signer:', signer)

        console.log('Contract Address:', COUNTER_ADDRESS)
        console.log('Contract ABI:', CounterArtifact.abi)

        const counterContract = new ethers.Contract(
          COUNTER_ADDRESS,
          CounterArtifact.abi,
          signer
        )
        
        console.log('Contract instance:', counterContract)
        setContract(counterContract)
        
        try {
          const currentCount = await counterContract.getCount()
          console.log('Current count:', currentCount)
          setCount(Number(currentCount))
        } catch (err) {
          console.error('Error getting count:', err)
        }

      } catch (err) {
        console.error('Initialization error:', err)
        setError('Error connecting to contract: ' + (err as Error).message)
      }
    }

    init()
  }, [])

  const handleIncrement = async () => {
    if (!contract) return
    try {
      const tx = await contract.increment()
      await tx.wait()
    } catch (err) {
      setError('Error incrementing: ' + (err as Error).message)
    }
  }

  const handleDecrement = async () => {
    if (!contract) return
    try {
      const tx = await contract.decrement()
      await tx.wait()
    } catch (err) {
      setError('Error decrementing: ' + (err as Error).message)
    }
  }

  return (
    <div>
      <div>
        Counter Value: {count}
      </div>
      <div>
        <button onClick={handleIncrement}>
          Increment
        </button>
        <button onClick={handleDecrement}>
          Decrement
        </button>
      </div>
      {error && (
        <div>
          {error}
        </div>
      )}
    </div>
  )
}

export default Counter
```

Update src/App.tsx:
```typescript
import Counter from './components/Counter'

function App() {
  return (
    <div>
      <h1>Counter DApp</h1>
      <Counter />
    </div>
  )
}

export default App
```

## Step 3: Running the Project

1. Start local Hardhat node:
```bash
cd smart-contracts
npx hardhat node
```

2. Deploy contract (in new terminal):
```bash
cd smart-contracts
npx hardhat run scripts/deploy.ts --network localhost
```

3. Copy the deployed contract address and update in frontend/.env:
```
VITE_CONTRACT_ADDRESS=paste_contract_address_here
```

4. Start frontend (in new terminal):
```bash
cd frontend
npm run dev
```

5. Configure MetaMask:
- Network Name: Localhost 8545
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

6. Import a test account:
- Copy a private key from the Hardhat node output
- Import into MetaMask using "Import Account"

## Troubleshooting

1. MetaMask Connection:
- Ensure MetaMask is installed
- Check if connected to localhost network
- Verify account has test ETH

2. Contract Deployment:
- Ensure Hardhat node is running
- Check if contract address is correct in .env
- Verify contract was deployed successfully

3. Frontend Issues:
- Check console for errors
- Verify contract artifacts path
- Ensure environment variables are loaded

4. Transaction Errors:
- Check MetaMask for transaction details
- Verify account has enough ETH for gas
- Check contract state in Hardhat console
