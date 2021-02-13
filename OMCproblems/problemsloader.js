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
  var contestGroup = "OMC";
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "contests/" + contestGroup + ".txt", false);
  xmlhttp.send(null);
  var problemsHTML;
  var contests = xmlhttp.responseText.split("\n");
  var contests_to_id = {};
  for(var i=0; i<Number(contests[0]); i++){
    contests_to_id[contests[i+1]] = i+1;
  }
  xmlhttp.open("GET", "infomations/" + contestGroup + ".txt", false);
  xmlhttp.send(null);
  var c_list = xmlhttp.responseText.split("\n");
  var rating = null;
  var rating_list = {};
  var joining_count = null;
  var joining_count_list = {};
  var sigmoid = function(a, d, r){
    return 1/(1 + Math.exp(-a * (r - d)));
  }

  var CAstatusNormalize = function(){ // if there if problem which has not been appended to localStorage, append it.
    for(var i=0; i<Number(contests[0]); i++){
      if(localStorage && !(contests[i+1] in localStorage.CAstatus)){
        localStorage.CAstatus[contests[i+1]] = [];
        console.log(JSON.parse(c_list[i]).length);
        for(var j=0; j<Number(JSON.parse(c_list[i]).length); j++){
          localStorage.CAstatus[contests[i+1]][j] = false;
        }
      }
      var f = true;
      for(var j=0; j<JSON.parse(c_list[i]).length; j++) f = f && localStorage.CAstatus[contests[i+1]][j];
      localStorage.CAstatus[contests[i+1]][-1] = f;
    }
    saveStorage(localStorage);
  }

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
      r = "red";
    }else{
      r = ["gray", "brown", "green", "cyan", "blue", "yellow", "orange"][Math.max(0, Math.floor(d / 400))];
    }
    return r
  }

  var makePH = function(){ // make problems HTML
    problemsHTML = {}
    for(var ci=0; ci<Number(contests[0]); ci++){
      var r = "";
      var c_name =  contests[ci+1];
      problemsHTML[c_name] = [];
      var c_dat = JSON.parse(c_list[ci]);
      for(var i=0; i<7; i++){
        if(i == 0){
          r = "<a target='_blank' class='" + contestGroup + "-contest' href='https://onlinemathcontest.com/contests/" + c_name + "/'>" + c_name + "</a>";
        }else if(i <= c_dat.length){
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
            p_class = diffColor(diff);
          }
          var diff_fill = diff >= 2800 ? 100 : (diff < 0 ? 0 :(diff - Math.floor(diff/400)*400) / 4);
          r = "<span class='show-diff' data-tooltip='Difficulty:" + (diff == null ? "unavailable" : (diff < 0 ? "<0" : Math.floor(diff))) + sp + "'>"
          /*if(p_dat["rated"])*/ r += makeDiffCircleHP(diff, 12, c_name, i-1);
          r += "<a target='_blank' class = '" + p_class + "-diff' href='https://onlinemathcontest.com/contests/" + c_name + "/tasks/" + c_name + "_" + alpha + "'>" + c_name + "-" + alpha + "</a></span>";
        }else{
          r = "";
        }
        problemsHTML[c_name][i] = r;
      }
    }
  }


  var show = function(){ // show problems table
    var tb = document.getElementById("problems-body");
    tb.innerHTML = "";
    for(var ci=0; ci<Number(contests[0]); ci++){
      var c_name = contests[ci+1];
      var h = "";
      for(var i=0; i<7; i++){
        h += "<td" + ((i < JSON.parse(c_list[ci]).length+1) && localStorage.CAstatus[c_name][i-1] ? " CA='True'" : " CA='False'") +" id='probs_" + c_name + "_" + i + "'>" + problemsHTML[c_name][i] + "</td>";
      }
      tb.innerHTML += "<tr>" + h + "</tr>";
    }
  }

  updateCAstatus = function(cont, quest){
    localStorage.CAstatus[cont][quest] = !localStorage.CAstatus[cont][quest];
    var f = true;
    for(var i=0; i<JSON.parse(c_list[contests_to_id[cont]]).length; i++) f = f && localStorage.CAstatus[cont][i];
    localStorage.CAstatus[cont][-1] = f;
    saveStorage(localStorage);
    document.getElementById("probs_" + cont + "_" + (Number(quest)+1)).setAttribute("ca", localStorage.CAstatus[cont][quest] ? 'True' : 'False');
    document.getElementById("probs_" + cont + "_0").setAttribute("ca", localStorage.CAstatus[cont][-1] ? 'True' : 'False');
  }

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
    makePH();
    show();
    if(localStorage){
      localStorage.userid = document.getElementById("userid").value;
      saveStorage(localStorage);
    }
  }
  window.onkeydown = function(e){
    if(e.key == "Enter") document.getElementById("userid_ok").onclick();
  }

  CAstatusNormalize();
  makePH();
  show();
  getRating();
  if(localStorage){
    document.getElementById("userid").value = localStorage.userid;
    document.getElementById("userid_ok").onclick();
  }
})
