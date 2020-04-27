#!/bin/python

import sys
import os
import json
import csv
from copy import deepcopy

import helper

DEFAULT_VIOLIN = {
	"type": "violin",
	"points": "jitter",
	"jitter": 0.85,
	"text": [],
	"hoverinfo": "text+y",
	"points": "all",
	"meanline": {"visible": "true", "color":"black"},
	"x": [],
	"y": [],
	"marker": {"opacity": 0.05},
	"pointpos": 0
}

def intialize_traces(header):
	""" given a list of the column headers, intialize the list of trace objects """
	result = []
	count = 1
	for col in header:
		if col != 'Barcodes':
			before_trace = deepcopy(DEFAULT_VIOLIN)
			before_trace.update({
				"name": str(col)+"_Before",
				"xaxis": 'x'+str(count),
				"yaxis": 'y'+str(count),
				"line": {"color": helper.COLOURS[0]},
			})
			result.append(before_trace)
			after_trace = deepcopy(DEFAULT_VIOLIN)
			after_trace.update({
				"name": str(col)+"_After",
				"xaxis": 'x'+str(count),
				"yaxis": 'y'+str(count),
				"line": {"color": helper.COLOURS[1]},
			})
			result.append(after_trace)
			count += 1

	return result

def scatter_qc_plots(dir_path, runID, qc_type):
	""" scatter plot labelled with tsv of chosen type """
	from scatter import get_coordinates, label_with_groups 
	barcode_coords = get_coordinates('umap', runID)
	traces = []
	num_cells = helper.get_cellcount(runID)
	qc_file = os.path.join(dir_path,'qc_data.tsv')
	if not os.path.isfile(qc_file):
		helper.return_error("qc_data.tsv file not found")
	qc_data = [line.rstrip('\n').split('\t') for line in open(qc_file)]
	if qc_type in qc_data[0]:
		label_with_groups(traces, barcode_coords, num_cells, qc_type, qc_data)
	else:
		helper.return_error("selected QC data not found in file")
	
	return traces

def before_after_plots(dir_path):
	""" before/after filtering is chosen plot"""
	traces = []
	qc_files = ['BeforeFiltering.tsv','AfterFiltering.tsv']
	for qc_file in qc_files:
		if not os.path.isfile(os.path.join(dir_path,qc_file)):
			helper.return_error(qc_file + " file not found")
		else:
			# parse the file
			with open(os.path.join(dir_path,qc_file)) as tsv_file:
				reader = csv.reader(tsv_file, delimiter="\t")
				header = next(reader)
				traces = intialize_traces(header) if not traces else traces
				for row in reader:
					for trace in traces:
						# only append to 'before' trace if using 'before' file & vice versa
						if trace['name'].split('_')[1] == 'Before' and qc_file == 'BeforeFiltering.tsv':
							trace['text'].append(row[header.index('Barcodes')])
							trace['x'].append("Before QC")
							trace['y'].append(row[header.index(trace['name'].split("_")[0])])
						elif trace['name'].split('_')[1] == 'After' and qc_file == 'AfterFiltering.tsv':
							trace['text'].append(row[header.index('Barcodes')])
							trace['x'].append("After QC")
							trace['y'].append(row[header.index(trace['name'].split("_")[0])])

	return traces

def get_qc_data(runID, qc_type):
	""" given a runID get the qc results """
	# check directory existence
	dir_path = "/usr/src/app/results/{runID}/SEURAT/frontend_qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		# try command-line path
		dir_path = "../../results/{runID}/SEURAT/frontend_qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("QC results folder not found: "+str(dir_path))

	if qc_type == 'Before_After_Filtering':
		traces = before_after_plots(dir_path)
	elif qc_type in ['Number_of_Genes','Number_of_Reads','Mitochondrial_Genes_Percentage','Ribosomal_Protein_Genes_Percentage']:
		traces = scatter_qc_plots(dir_path, runID, qc_type)
	else:
		helper.return_error(str(qc_type)+ " is not a valid option")

	return traces

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID, qc_type = params['runID'], params['qc_type']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	qc_data = get_qc_data(runID, qc_type)
	print(json.dumps(qc_data))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
