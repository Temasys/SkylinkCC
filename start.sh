#Must be run in background
sleep 1
#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    google-chrome http://localhost:8082/demo/agent.html
    google-chrome http://localhost:8082/demo/client.html
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
	google-chrome http://localhost:8082/demo/agent.html
	google-chrome http://localhost:8082/demo/client.html
    ;;
  'MINGW32_NT-6.1')
    OS='Windows'
	start chrome "http://localhost:8082/demo/agent.html"
	start chrome "http://localhost:8082/demo/client.html"
    ;;
  'Darwin')
    OS='Mac'
    open -a /Applications/Google\ Chrome.app http://localhost:8082/demo/agent.html;
	open -a /Applications/Google\ Chrome.app http://localhost:8082/demo/client.html;
    ;;
  'AIX') ;;
  *) echo "OS $OS not recognized";;
esac