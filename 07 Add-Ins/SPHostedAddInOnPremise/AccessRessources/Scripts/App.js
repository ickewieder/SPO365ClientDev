var hostUrl;
var appUrl;
var hostListName = "News";
var appListName = "AppWebNews";

$(document).ready(function () {
    hostUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appUrl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
});

function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
};

var errorHandler = function (sender, args) {
    console.log(args.get_message());    
};

function readHostWebCSOM() {
    debugger;

    var appContext = new SP.ClientContext.get_current();
    var hostContext = new SP.AppContextSite(appContext, hostUrl);

    var web = hostContext.get_web();    
    var list = web.get_lists().getByTitle(hostListName);

    appContext.load(web);
    appContext.load(list);
    appContext.executeQueryAsync(function () {
        $("#workbench").html("Host web list loaded successfully: " + list.get_title());
        },errorHandler);
}

function readAppWebCSOM() {
    debugger;

    var appContext = new SP.ClientContext.get_current();

    var web = appContext.get_web();
    var list = web.get_lists().getByTitle(appListName);

    appContext.load(list);
    appContext.executeQueryAsync(function () {
        $("#workbench").html("App web list loaded successfully: " + list.get_title());
    }, errorHandler);
}

function writeHostWebCSOM() {
    debugger;

    var appContext = new SP.ClientContext.get_current();
    var hostContext = new SP.AppContextSite(appContext, hostUrl);

    var list = hostContext.get_web().get_lists().getByTitle(hostListName);
    var lci = new SP.ListItemCreationInformation();
    var li = list.addItem(lci);
    li.set_item('Title', 'News in HostWeb created by CSOM');
    li.set_item('Body', "Lorem ipsum ...");
    li.update();

    appContext.load(li);    
    appContext.executeQueryAsync(function () {
        $("#workbench").html("Host Web list item created successfully: " + li.get_item('Title') + "<br>See console for output");
        queryList(list);
    }, errorHandler);
}

function writeAppWebCSOM() {
    this.appContext = new SP.ClientContext.get_current();

    var list = appContext.get_web().get_lists().getByTitle(appListName);
    var lci = new SP.ListItemCreationInformation();
    var li = list.addItem(lci);
    li.set_item('Title', 'News in AppWeb created by CSOM');
    li.set_item('Body', "Lorem ipsum ...");
    li.update();

    appContext.load(li);
    appContext.executeQueryAsync(function () {
        $("#workbench").html("App Web list item created successfully: " + li.get_item('Title') + "<br>See console for output");
        queryList(list);
    }, errorHandler);
}

function queryList(createdList) {
    
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where></Query></View>');
    var lis = createdList.getItems(camlQuery);

    appContext.load(lis);
    appContext.executeQueryAsync(function() {
        var result = '';
        var liEnumerator = lis.getEnumerator();
        while (liEnumerator.moveNext()) {
            var oListItem = liEnumerator.get_current();
            result += '\nID: ' + oListItem.get_id() +
                '\nTitle: ' + oListItem.get_item('Title') +
                '\Created: ' + oListItem.get_item('Created');
        }
        console.log(result);
    }, errorHandler);
}

var errorHandlerREST = function (err) {
    console.log("REST error:");
    console.log(err);
};

function readHostWebREST() {
    debugger;

    var path = hostUrl + "/_layouts/15/";

    $.getScript(path + "SP.RequestExecutor.js", function () {

        var executor = new SP.RequestExecutor(appUrl);
        executor.executeAsync(
                {
                    url: appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('" + hostListName + "')?@target='" + hostUrl + "/" + hostListName + "'",
                    method: "GET",
                    headers: { "Accept": "application/json; odata=verbose" },
                    success: function (data) {
                        var list = JSON.parse(data.body).d;
                        $("#workbench").html("Read from host REST successfull - See console for output");
                        console.log(list);
                    },
                    error: errorHandlerREST
                }
            );
    });
}

function readHostWebjQuery() {
    debugger;

    var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('" + hostListName + "')/items?@target='" + hostUrl + "'";

    $.ajax({
        url: url,
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        success: function (data) {
            $("#workbench").html("Read from host web using REST jQuery successfull  - See console for output");
            console.log(data.d.results);
        },
        error: errorHandlerREST
    });
}

function readAppWebREST() {
    debugger;

    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + appListName + "')/GetItems(query=@v1)?@v1={\"ViewXml\":\"<View><Query><OrderBy><FieldRef Name='Created' Ascending='FALSE' /></OrderBy></Query></View>\"}",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json; odata=verbose"
        },
        success: function (data) {
            if (data.d.results) {
                $("#workbench").html("Read from app web using REST successfull  - See console for output");
                console.log(data.d);
            }
        },
        error: errorHandlerREST
    });
}

function writeHostWebREST() {
    debugger;

    var item = {
        "__metadata": { "type": "SP.Data." + hostListName + "ListItem" },
        "Title": "Lorem ipsum news from app"
    };

    var url = appUrl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('" + hostListName + "')/items?@target='" + hostUrl + "'";

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            $("#workbench").html("Item created in the host web  - See console for output");
            console.log(data.d);
        },
        error: errorHandlerREST
    });
}

function writeAppWebREST() {
    debugger;

    var item = {
        "__metadata": { "type": "SP.Data." + appListName + "ListItem" },
        "Title": "Lorem ipsum news from app"
    };

    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + appListName + "')/items";

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            $("#workbench").html("Item created in the app web  - See console for output");
            console.log(data.d);
        },
        error: errorHandlerREST
    });
}

function useWebProxy() {
    debugger;

    const appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    const context = new SP.ClientContext(appweburl);

    const request = new SP.WebRequestInfo();
    request.set_url("http://services.odata.org/Northwind/Northwind.svc/Categories");
    request.set_method("GET");
    request.set_headers({ "Accept": "application/json;odata=verbose" });

    var response = SP.WebProxy.invoke(context, request);
    $("#workbench").html("<P>Loading categories...</P>");

    // Set the event handlers and invoke the request.
    context.executeQueryAsync(function successHandler() {
            if (response.get_statusCode() == 200) {
                const categories = JSON.parse(response.get_body());
                let result = "<UL>";
                for (let i = 0; i < categories.d.results.length; i++) {
                    const categoryName = categories.d.results[i].CategoryName;
                    const description = categories.d.results[i].Description;
                    result += `<LI>${categoryName}:&nbsp;${description}</LI>`;
                }
                result += "</UL>";
                $("#workbench").html(result);
            } else {
                $("#workbench").html(`<P>Status code: ${response.get_statusCode()}<br/>${response.get_body()}`);
            }
        },
        function(sender, args) {
            console.log(args.get_message());
        });
}

function userNorthwind2018() {

    $.ajax({
        url: "http://services.odata.org/Northwind/Northwind.svc/Categories",
        cache: false
    }).then(function (data) { console.log(data) });
}