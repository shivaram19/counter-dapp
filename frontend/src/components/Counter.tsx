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