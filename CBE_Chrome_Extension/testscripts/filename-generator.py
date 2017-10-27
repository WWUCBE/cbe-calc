from os import listdir
from os.path import isfile, join

testpages = "../testpages"

for f in listdir(testpages):
	path = join(testpages,f)
	if isfile(path):
		print('{path: "testpages/' + f + '", name: "' + f[0:-5] + '"},')
