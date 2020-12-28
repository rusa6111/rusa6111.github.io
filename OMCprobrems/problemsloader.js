$(function(){
  var contestGroup = "OMC";
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "contests/" + contestGroup + ".txt", false);
  xmlhttp.send(null);
  var contests = xmlhttp.responseText.split("\n");
  console.log(contests);
  for(var ci=0; ci<Number(contests[0]); ci++){
    var r = "";
    var c_name =  contests[ci+1];
    xmlhttp.open("GET", "infomations/" + c_name + ".txt", false);
    xmlhttp.send(null);
    var c_dat = JSON.parse(xmlhttp.responseText);
    for(var i=0; i<7; i++){
      if(i == 0){
        r += "<td><a class='" + contestGroup + "-contest' href='https://onlinemathcontest.com/contests/" + c_name + "/'>" + c_name + "</a></td>";
      }else{
        var alpha = "ABCDEF"[i-1];
        var p_dat = c_dat[i-1];
        var diff = p_dat["diff"];
        var p_class = "none";
        var p_color = "#000#"
        if(p_dat["rated"]){
          if(diff >= 2800){
            p_class = "red";
            p_color = "#00F";
          }else{
            p_class = ["gray", "brown", "green", "cyan", "blue", "yellow", "orange"][Math.max(0, Math.floor(diff / 400))];
            p_color = ["#888", "#840", "#080", "#0CC", "#00F", "#CC0", "#F80", "#F00"][Math.max(0, Math.floor(diff / 400))];
          }
        }
        var diff_fill = diff >= 2800 ? 100 : (diff < 0 ? 0 :(diff - Math.floor(diff/400)*400) / 4);
        r +="<td><span class='show-diff' data-tooltip='Difficulty:" + Math.floor(diff) + "'><div class='" + p_class + "-circle' style='background: linear-gradient(to top," + p_color + " 0%, " + p_color + " " + diff_fill + "%, #0000 " + diff_fill + "%, #0000 100%);'></div>";
        r += "<a class = '" + p_class + "-diff' href='https://onlinemathcontest.com/contests/" + c_name + "/tasks/" + c_name + "_" + alpha + "'>" + c_name + "-" + alpha + "</a></span></td>";
      }
    }
    $("#problems-body").append("<tr>" + r + "</tr>");
  }
})
