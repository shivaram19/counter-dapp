import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";

describe("Counter", function () {
  let counter: Counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy(0);
    await counter.waitForDeployment();
  });

  it("Should start with count of 0", async function () {
    expect(await counter.getCount()).to.equal(0);
  });

  it("Should increment count", async function () {
    await counter.increment();
    expect(await counter.getCount()).to.equal(1);
  });

  it("Should decrement count", async function () {
    await counter.increment();
    await counter.decrement();
    expect(await counter.getCount()).to.equal(0);
  });

  it("Should not decrement below 0", async function () {
    await expect(counter.decrement()).to.be.revertedWith(
      "Counter: cannot decrement below zero"
    );
  });

  it("Should emit event on count change", async function () {
    await expect(counter.increment())
      .to.emit(counter, "CountChanged")
      .withArgs(1);
  });
});
