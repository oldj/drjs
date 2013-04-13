function test() {
	var time0 = new Date();
	canvas = new drjs.Canvas({}, "canvas1");
	
	//画D
	canvas.draw("arc", [100, 50, -90, 90], -25, 50, "#A72D00", false, 16);
	canvas.draw("line", [[50, 50], [50, 150]], 25, 0, "#A72D00", false, 16);
	//画r
	canvas.draw("line", [[50, 50], [50, 100]], 150, 50, "#A9B432", false, 16);
	canvas.draw("arc", [25, 25, 180, 270, true], 200, 100, "#A9B432", false, 16);
	//画j
	canvas.draw("line", [[300, 50], [300, 100]], 0, 0, "#F4C610", false, 16);
	canvas.draw("arc", [25, 50, 0, 180, true], 250, 50, "#F4C610", false, 16);
	//画s
	canvas.draw("arc", [25, 12.5, -270, 0, true], 325, 100, "#93880A", false, 16);
	canvas.draw("arc", [25, 12.5, -90, 180, true], 325, 125, "#93880A", false, 16);
	
	//画笑脸
	canvas.draw("oval", [80, 80], 160, 180, "#446000", false, 5);
	canvas.draw("dot", [200, 240], 0, 0, "#446000", false, 16);
	canvas.draw("dot", [280, 240], 0, 0, "#446000", false, 16);
	canvas.draw("arc", [40, 40, 30, 150, true], 200, 240, "#446000", false, 5);
	
	canvas.show();
	
	var time1 = new Date();
	
	document.getElementById("info1").innerHTML = "<strong>Info:</strong> 使用了 " +
		canvas.count() + " 个DOM节点，耗时 " + (time1 - time0) +
		" 毫秒";
}


window.onload = test;