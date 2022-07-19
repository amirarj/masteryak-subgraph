import { Address, BigDecimal, BigInt, dataSource, ethereum, log } from "@graphprotocol/graph-ts"
import {
  MasterYak,
  ChangedAddress,
  ChangedOwner,
  ChangedRewardsEndTimestamp,
  ChangedRewardsPerSecond,
  Deposit,
  EmergencyWithdraw,
  PoolAdded,
  PoolUpdated,
  SetRewardsStartTimestamp,
  Withdraw
} from "../generated/MasterYak/MasterYak"
import { DepositTo, WithdrawTo, Pool, User, RewardsEndTimestamp } from "../generated/schema"

const yadadd = Address.fromString('0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f')

export function handleChangedOwner(event: ChangedOwner): void {}

export function handleChangedAddress(event: ChangedAddress): void {}

export function handleChangedRewardsPerSecond(event: ChangedRewardsPerSecond): void {}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {}

export function handlePoolAdded(event: PoolAdded): void {}

export function handlePoolUpdated(event: PoolUpdated): void {}

export function handleSetRewardsStartTimestamp(event: SetRewardsStartTimestamp): void {}



export function handleDeposit(event: Deposit): void {

    let deposit = DepositTo.load(event.transaction.hash.toHex())
    if (!deposit) {
      deposit = new DepositTo(event.transaction.hash.toHex())
      deposit.amount = event.params.amount
      deposit.blockTimestamp = event.block.timestamp
      if (event.params.amount == BigInt.fromString('0')) {
        deposit.harvest = true
      } else {
        deposit.harvest = false
      }
      deposit.user = event.params.user.toHex()
      deposit.pool = event.params.pid.toString()
      const masteryak = MasterYak.bind(yadadd)
      const poolInfoResult = masteryak.try_poolInfo(event.params.pid)
      const poolInfo = poolInfoResult.value
      const pool = getPool(event.params.pid, event.block)
      pool.allocPoint = poolInfo.value1
      pool.lastRewardTimestamp = poolInfo.value2
      pool.accRewardsPerShare = poolInfo.value3
      pool.totalStaked = poolInfo.value4
      pool.vpForDeposit = poolInfo.value5
      const user = getUser(event.params.user, event.block)
      deposit.save()
      pool.save()
    }
}


export function handleWithdraw(event: Withdraw): void {
    
  let withdraw = WithdrawTo.load(event.transaction.hash.toHex())
  if (!withdraw) {
    withdraw = new WithdrawTo(event.transaction.hash.toHex())
    withdraw.amount = event.params.amount
    withdraw.blockTimestamp = event.block.timestamp
    withdraw.user = event.params.user.toHex()
    withdraw.pool = event.params.pid.toString()
    const masteryak = MasterYak.bind(yadadd)
    const poolInfoResult = masteryak.try_poolInfo(event.params.pid)
    const poolInfo = poolInfoResult.value
    const pool = getPool(event.params.pid, event.block)
    pool.allocPoint = poolInfo.value1
    pool.lastRewardTimestamp = poolInfo.value2
    pool.accRewardsPerShare = poolInfo.value3
    pool.totalStaked = poolInfo.value4
    pool.vpForDeposit = poolInfo.value5
    const user = getUser(event.params.user, event.block)
    withdraw.save()
    pool.save()
  }
}

export function handleChangedRewardsEndTimestamp(event: ChangedRewardsEndTimestamp): void {

  let time = RewardsEndTimestamp.load(event.transaction.hash.toHex())
  if (!time) {
     time = new RewardsEndTimestamp(event.transaction.hash.toHex())
     time.oldEndTimestamp = event.params.oldEndTimestamp
     time.newEndTimestamp = event.params.newEndTimestamp
     
     time.save()  
}

}


export function getPool(id: BigInt, block: ethereum.Block): Pool {
  let pool = Pool.load(id.toString())
  const masteryak = MasterYak.bind(yadadd)
  const poolInfoResult = masteryak.try_poolInfo(id)

  const poolInfo = poolInfoResult.value

  if (!pool) {
    pool = new Pool(id.toString())

    pool.pair = poolInfo.value0
    if (poolInfo.value0 == Address.fromString("0x59414b3089ce2af0010e7523dea7e2b35d776ec7")) {
       pool.name = 'Yak Token'
    } else if (poolInfo.value0 == Address.fromString("0xd2f01cd87a43962fd93c21e07c1a420714cc94c9")) {
       pool.name = 'PGL YAK-AVAX'
    } else if (poolInfo.value0 == Address.fromString("0x468eba06c845205fb79098ef3b95c0b319dc0541")) {
       pool.name = 'JLP YAK-AVAX (YRT)'
    } else if (poolInfo.value0 == Address.fromString("0xe8326e606793bf60a7a9ee13aaee1c06b3d4e491")) {
      pool.name = 'PGL YAK-AVAX (YRT)'
    } else if (poolInfo.value0 == Address.fromString("0x6dbf865f19cd0aaca9550bddd3b92f4f4e239468")) {
      pool.name = 'Gondola mYAK-YAK (YRT)'
    } else if (poolInfo.value0 == Address.fromString("0x69d8ebe4a431d51ef6720b7e4aed213615d2e614")) {
      pool.name = 'JLP mYAK-AVAX (YRT)'
    } else if (poolInfo.value0 == Address.fromString("0xe04d693e454eba8e9799e48fc0fd9adca3b4ab4f")) {
      pool.name = 'JLP YAK-AVAX (YRT)'
    } else {
      pool.name = 'N/A'
    }

    pool.allocPoint = poolInfo.value1
    pool.lastRewardTimestamp = poolInfo.value2
    pool.accRewardsPerShare = poolInfo.value3
    pool.totalStaked = poolInfo.value4
    pool.vpForDeposit = poolInfo.value5 
    pool.save()
  }
  return pool as Pool
}

export function getUser(address: Address, block: ethereum.Block): User {
  const id = address.toHex()

  let user = User.load(id)

  if (!user) {
    user = new User(id)
    user.save()
  }

  return user as User
}