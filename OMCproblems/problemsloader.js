$(function(){
  var contestGroup = "OMC";
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "contests/" + contestGroup + ".txt", false);
  xmlhttp.send(null);
  var problemsHTML;
  var contests = xmlhttp.responseText.split("\n");
  xmlhttp.open("GET", "infomations/" + contestGroup + ".txt", false);
  xmlhttp.send(null);
  var c_list = xmlhttp.responseText.split("\n");
  var rating = null;
  var rating_list = {};
  var sigmoid = function(a, d, r){
    return 1/(1 + Math.exp(-a * (r - d)));
  }
  var makePH = function(){
    problemsHTML = {}
    for(var ci=0; ci<Number(contests[0]); ci++){
      var r = "";
      var c_name =  contests[ci+1];
      problemsHTML[c_name] = [];
      var c_dat = JSON.parse(c_list[ci]);
      for(var i=0; i<7; i++){
        if(i == 0){
          r = "<a target='_blank' class='" + contestGroup + "-contest' href='https://onlinemathcontest.com/contests/" + c_name + "/'>" + c_name + "</a>";
        }else{
          var alpha = "ABCDEF"[i-1];
          var p_dat = c_dat[i-1];
          var diff = p_dat["diff"];
          if((rating != null) && (p_dat["rated"] == 1)){
            sp = "\nSolve Prob:";
            sp += Math.floor(sigmoid(p_dat["disc"], diff, rating)*100) + "%";
          }else{
            sp = "";
          }
          var p_class = "none";
          var p_color = "#000#"
          if(p_dat["rated"]){
            if(diff >= 2800){
              p_class = "red";
              p_color = "#F00";
            }else{
              p_class = ["gray", "brown", "green", "cyan", "blue", "yellow", "orange"][Math.max(0, Math.floor(diff / 400))];
              p_color = ["#888", "#840", "#080", "#0CC", "#00F", "#CC0", "#F80"][Math.max(0, Math.floor(diff / 400))];
            }
          }
          var diff_fill = diff >= 2800 ? 100 : (diff < 0 ? 0 :(diff - Math.floor(diff/400)*400) / 4);
          r = "<span class='show-diff' data-tooltip='Difficulty:" + Math.floor(diff) + sp + "'><div class='" + p_class + "-circle' style='background: linear-gradient(to top," + p_color + " 0%, " + p_color + " " + diff_fill + "%, #0000 " + diff_fill + "%, #0000 100%);'></div>";
          r += "<a target='_blank' class = '" + p_class + "-diff' href='https://onlinemathcontest.com/contests/" + c_name + "/tasks/" + c_name + "_" + alpha + "'>" + c_name + "-" + alpha + "</a></span>";
        }
        problemsHTML[c_name][i] = r;
      }
    }
  }
  var show = function(){
    var tb = document.getElementById("problems-body");
    tb.innerHTML = "";
    for(var ci=0; ci<Number(contests[0]); ci++){
      var c_name = contests[ci+1];
      var h = "";
      for(var i=0; i<7; i++){
        h += "<td>" + problemsHTML[c_name][i] + "</td>";
      }
      tb.innerHTML += "<tr>" + h + "</tr>";
    }
  }
  var getRating = function(){
    xmlhttp.open("GET", "rating.txt", false);
    xmlhttp.send(null);
    var get_t = xmlhttp.responseText.split("\n");
    for(var i=0; get_t[i] != ""; i++){
      var p = get_t[i].split(" ");
      rating_list[p[0]] = Number(p[1]);
    }
  }
  document.getElementById("userid_ok").onclick = function(e){
    var value = document.getElementById("userid").value;
    if(value in rating_list){
      rating = rating_list[value];
    }else{
      rating = null;
    }
    makePH();
    show();
  }


  makePH();
  show();
  getRating();
  if(document.getElementById("userid").value != ""){
    document.getElementById("userid_ok").onclick();
  }
})
