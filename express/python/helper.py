#!/bin/python

import sys
import json

def return_error(msg):
	""" format the error message and perform a system flush before exiting """
	print(json.dumps({"error": msg}))
	sys.stdout.flush()
	sys.exit()

