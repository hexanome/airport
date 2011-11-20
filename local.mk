launch:
	@echo "launch"
	@if [ `id -u` -ne "0" -a $(PORT) -lt 1024 ] ;  \
	then  \
	  cd web ; sudo node ../server.js ../config.json ;  \
	else  \
	  cd web ; node ../server.js ../config.json;  \
	fi
