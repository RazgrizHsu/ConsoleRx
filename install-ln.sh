Path=~/.CocosCreator/packages/ConsoleRx

mkdir -p ~/.CocosCreator/packages
[ -d "$Path" ] && rm -rf "$Path";
ln -s $(pwd)/package $Path