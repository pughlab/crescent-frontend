#!/bin/python

import sys
import json
from operator import itemgetter


def return_error(msg):
	""" format the error message and perform a system flush before exiting """
	print(json.dumps({"error": msg}))
	sys.stdout.flush()
	sys.exit()

def sort_traces(trace_objects):
	""" sort the lists of violin, opacity, or scatter objects by cluster name """
	trace_objects.sort(key=itemgetter('name'))
	return 
