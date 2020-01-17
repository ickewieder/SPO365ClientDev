$(document).ready(function() {
  getItems();
});

var items;
var item;

function getItems() {
  $.ajax({
    url:
      "http://sp2019/_api/lists/getByTitle('News')/Items?$select=Id,Title,Body,Created,Modified",
    type: "GET",
    headers: {
      Accept: "application/json;odata=verbose"
    },
    success: function(data) {
      if (data.d.results) {
        //console.log(data.d.results);
        items = data.d.results;
        renderNews(items);
      }
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function renderNews(items) {
  var html = `<table border="1"><tr><th>Title</th><th>Body</th><th>Created</th><th>Modified</th></tr>`;
  items.forEach(item => {
    html += `<tr style="cursor:pointer" onclick="renderDetails(${
      item.Id
    })"><td>${item.Title}</td><td>${item.Body}</td><td>${
      item.Created
    }</td><td>${item.Modified}</td></tr>`;
  });
  html += `</table>`;

  $("#newsTable").html(html); //jQuery Syntax
  //document.getElementById("result").innerHTML = html; JS Native
}

function renderDetails(id) {
  item = items.find(el => el.Id == id);
  console.log("row was clicked: ", item);
  if (item != null) {
    let b = $("#id").val(item.Id);
    $("#title").val(item.Title);
    // $("#body").html(item.Body);
    $("#created").val(item.Modified);
  }
}
/*
function saveNews() {

    Object.assign(item, {
    Id: $("#id").val(),
    Title: $("#title").val(),
    Body: $("#body").html()
  });

  console.log("saving", item);

  var listItemUri =
    "http://sp2019/_api/web/lists/getbytitle('News')/items(" +
    item.Id +
    ")";

  $.ajax({
    url: listItemUri,
    type: "POST",
    data: JSON.stringify(item),
    contentType: "application/json;odata=verbose",
    headers: {
      Accept: "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "X-HTTP-Method": "MERGE",
      "If-Match": "*"
    },
    success: function() {
      console.log("item has been updated");
      getItems();
    },
    error: function(err) {
      console.log(err);
    }
  });
}*/
