function _bind(func, obj){
	return function(){func.apply(obj, arguments)};
}
function echo(){
	console.debug(this);
	console.debug(arguments);
}
