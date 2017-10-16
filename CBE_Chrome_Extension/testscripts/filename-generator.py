<<<<<<< HEAD
from os import listdir
from os.path import isfile, join

testpages = "../testpages"

for f in listdir(testpages):
	path = join(testpages,f)
	if isfile(path):
		print('"testpages/' + f + '",')
=======
from os import listdir
from os.path import isfile, join

testpages = "../testpages"

for f in listdir(testpages):
	path = join(testpages,f)
	if isfile(path):
		print('"testpages/' + f + '",')
>>>>>>> a890869276fa48dc077bbd9f970450f3d9c60672
