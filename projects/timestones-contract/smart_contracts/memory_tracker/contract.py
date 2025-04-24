from algopy import ARC4Contract, String
from algopy.arc4 import abimethod


class MemoryTracker(ARC4Contract):

    def __init__(self):
        
    @abimethod()
    def hello(self, name: String) -> String:
        return "Hello, " + name
