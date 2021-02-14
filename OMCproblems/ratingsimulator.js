$(function(){
  var localStorage;
  if("localStorage" in window){
    if(!window.localStorage.OMCproblems){
      localStorage = {};
    } else {
      localStorage = JSON.parse(window.localStorage.OMCproblems);
    }
    if(!("userid" in localStorage)) localStorage.userid = "";
    if(!("CAstatus" in localStorage)) localStorage.CAstatus = {};
    var saveStorage = function(d){
      window.localStorage.OMCproblems = JSON.stringify(d);
    }
    saveStorage(localStorage);
  }
  var rating = 1;
  var rating_list = {};
  var joining_count = 1;
  var joining_count_list = {};
  var xmlhttp = new XMLHttpRequest();
  var getRating = function(){ //get solvers rating
    xmlhttp.open("GET", "rating.txt", false);
    xmlhttp.send(null);
    var get_t = xmlhttp.responseText.split("\n");
    for(var i=0; get_t[i] != ""; i++){
      var p = get_t[i].split(" ");
      rating_list[p[0]] = Number(p[1]);
      joining_count_list[p[0]] = Number(p[2]);
    }
  }
  getRating();

  var makeDiffCircleHP = function(d, r, cont, quest){ // make HTML of difficulty circle
    if(d == null){
      p_color = "#147";
      d = 0;
    }else if(d > 2800){
      p_color = "#F00";
    }else{
      p_color = ["#888", "#840", "#080", "#0CC", "#00F", "#CC0", "#F80"][Math.max(0, Math.floor(d / 400))];
    }
    var diff_fill = d >= 3200 ? 100 : (d < 0 ? 0 :(d - Math.floor(d/400)*400) / 4);
    var style = ""
    style += "border:solid 1px " + p_color + ";";
    style += "height: " + r + ";width: " + r + ";";
    style += "background: linear-gradient(to top," + p_color + " 0%, " + p_color + " " + diff_fill + "%, #0000 " + diff_fill + "%, #0000 100%);";
    return "<div class='diff-circle' style='" + style + "'" + (cont ? (" onclick='updateCAstatus(\"" + cont + "\", \"" + quest + "\")'") : "") + "></div>";
  }

  var diffColor = function(d){
    if(d >= 2800){
      r = "#F00";
    }else{
      r = ["#888", "#840", "#080", "#0CC", "#00F", "#CC0", "#F80"][Math.max(0, Math.floor(d / 400))];
    }
    return r
  }

  document.getElementById("userid_ok").onclick = function(e){
    var value = document.getElementById("userid").value;
    var ratingHTML = document.getElementById("rating");
    if(value in rating_list){
      rating = rating_list[value];
      joining_count = joining_count_list[value];
      ratingHTML.innerHTML = "Your rating: " + makeDiffCircleHP(rating, 12, "", "") + "<span class='" + diffColor(rating) + "-diff'>" + rating + "</span>";
    }else{
      rating = null;
      ratingHTML.innerHTML = "";
    }
    if(localStorage){
      localStorage.userid = document.getElementById("userid").value;
      saveStorage(localStorage);
    }
  }

  var rating_norm = function(r, c){
    r2 = r >= 400 ? r : 400*(1-Math.log(400/r));
    r3 = r2 + 1200 * (((Math.sqrt(1 - Math.pow(0.81, c)) / (1 - Math.pow(0.9, c))) - 1) / (Math.sqrt(19) - 1));
    r4 = (0.9 - Math.pow(0.9, c+1)) / (0.9 - Math.pow(0.9, c+2)) * Math.pow(2, r3/800);
    return 0.9 * r4;
  }

  var func = function(r, c, p){
    p = p >= 400 ? p : 400*(1-Math.log(400/p));
    r4 = r + 0.09 * Math.pow(2, p/800) / (0.9 - Math.pow(0.9, c+2));
    r5 = 800 * Math.log2(r4) - 1200 * (((Math.sqrt(1 - Math.pow(0.81, c+1)) / (1 - Math.pow(0.9, c+1))) - 1) / (Math.sqrt(19) - 1));
    rn = r5 >= 400 ? r5 : 400 / Math.exp((400 - r5) / 400);
    return rn;
  }

  var show = function(){
    var width = document.getElementById("main_body").clientWidth//document.body.clientWidth;
    var canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = width * 0.4;
    var ctx = canvas.getContext("2d");
    width /= 1000;
    var r = rating_norm(rating, joining_count);
    //console.log(r);
    var min_p = 0;
    var max_p = 10;
    var min_r = Math.floor(func(r, joining_count, min_p*400)/400);
    var max_r = Math.floor((func(r, joining_count, max_p*400)-1)/400)+1;
    for(var i=1; i<=max_r-min_r; i+=1){
      ctx.fillStyle = diffColor((max_r-i) * 400) + "5";
      ctx.fillRect(Math.floor(50*width) , Math.floor((20 + 350*(i-1)/(max_r-min_r))*width), Math.floor(930 * width), Math.floor(350 * width / (max_r-min_r)));
    }
    for(var i=0; i<max_p-min_p; i+=1){
      ctx.fillStyle = diffColor(i * 400) + "5";
      ctx.fillRect(Math.floor((50 + 930*i/(max_p-min_p))*width), Math.floor(371 * width), Math.floor(930 * width / (max_p-min_p)), Math.floor(4 * width));
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#0004"
    for(var i=0; i<=max_r-min_r; i+=0.249999){
      ctx.beginPath();
      ctx.moveTo(Math.floor(50*width) , Math.floor((20 + 350*i/(max_r-min_r))*width));
      ctx.lineTo(Math.floor(980*width), Math.floor((20 + 350*i/(max_r-min_r))*width));
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    for(var i=0; i<=max_r-min_r; i+=1){
      ctx.beginPath();
      ctx.moveTo(Math.floor(45*width) , Math.floor((20 + 350*i/(max_r-min_r))*width));
      ctx.lineTo(Math.floor(980*width), Math.floor((20 + 350*i/(max_r-min_r))*width));
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#0004"
    for(var i=0; i<=max_p-min_p; i+=0.249999){
      ctx.beginPath();
      ctx.moveTo(Math.floor((50 + 930*i/(max_p-min_p))*width), Math.floor(20*width));
      ctx.lineTo(Math.floor((50 + 930*i/(max_p-min_p))*width), Math.floor(370*width));
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    for(var i=0; i<=max_p-min_p; i+=1){
      ctx.beginPath();
      ctx.moveTo(Math.floor((50 + 930*i/(max_p-min_p))*width), Math.floor(20*width));
      ctx.lineTo(Math.floor((50 + 930*i/(max_p-min_p))*width), Math.floor(375*width));
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000c"
    console.log(min_r*400, max_r*400);
    for(var i=min_p*400; i<max_p*400; i+=5){
      var ra = func(r, joining_count, i);
      var rb = func(r, joining_count, i+5);
      ctx.beginPath()
      ctx.moveTo((50 + 930 * (i  -min_p*400) / (max_p-min_p) / 400) * width, (370 - 350 * (ra-min_r*400) / (max_r-min_r) / 400) * width);
      ctx.lineTo((50 + 930 * (i+5-min_p*400) / (max_p-min_p) / 400) * width, (370 - 350 * (rb-min_r*400) / (max_r-min_r) / 400) * width);
      ctx.stroke();
    }
    ctx.fillStyle = "#444a"
    ctx.font = (7*width) + "px Roboto Condensed, sans-serif"
    for(var i=min_p*400; i<=max_p*400; i+=100){
      var text = i + "";
      ctx.fillText(text, (50 + 930 * (i  -min_p*400) / (max_p-min_p) / 400) * width - ctx.measureText(text).width/2, 381*width);
    }
    for(var i=min_r*400; i<=max_r*400; i+=100){
      var text = i + "";
      ctx.fillText(text, 43 * width - ctx.measureText(text).width, (372 - 350 * (i-min_r*400) / (max_r-min_r) / 400) * width);
    }
  }
  window.setInterval(show, 100);
  window.onkeydown = function(e){
    if(e.key == "Enter") document.getElementById("userid_ok").onclick();
  }
  if(localStorage){
    document.getElementById("userid").value = localStorage.userid;
    document.getElementById("userid_ok").onclick();
  }
  show();
})
