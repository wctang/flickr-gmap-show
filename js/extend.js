function extend(Constructor,Parent) {
	var Inh=function(){}; Inh.prototype=Parent.prototype; Constructor.prototype=new Inh();
	Constructor.prototype.constructor=Constructor; Constructor.superconstructor=Parent;
}
