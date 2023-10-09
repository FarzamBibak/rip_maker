var url, link, base_url, zip, settings, response1, hrefNameList, hrefLinkList,
    d_count, search, match, slice, slice1, backward, forward, indexOf, button,
    input, href, hrefName, search1, regex, searchHrefNameSlice, attribute, settings1;


button = ("<button type='button' id='submit-button'> download </button>");
input = ("<input id='input-value' type='text'>");
$("body").append(input);
$("body").append(button);

$("#submit-button").click(function () {

    url = $("#input-value").val();
    link = url;
    base_url = link.search("//");
    link = link.slice(base_url + 2)
    base_url = link.search("/")
    link = link.slice(0, base_url)

    zip = new JSZip();

    settings = {
        "url": url,
        "method": "GET",
        "timeout": 0,
    };

    hrefNameList = [];
    hrefLinkList = [];
    d_count = 0;

    $.ajax(settings).done(function (response) {

        response1 = response;

        function Rip(tag, attribute, format = [], folderName, callback) {

            search = response.search(tag);
            match = $(response.match(tag))[0];
            slice = response;
            slice1 = slice.slice(search - 1);

            for (let i = search; i < slice.length; i++) {
                search = slice.search(tag)
                i = search

                slice1 = slice.slice(i - 1)
                slice = slice.slice(i + match.length)

                if (slice1[0] == ">") {
                    slice1 = slice1.slice(1)
                }

                if (search !== -1) {
                    if ($($(slice1)[0]).attr(attribute) !== undefined) {

                        href = $($(slice1)[0]).attr(attribute),
                            replace_href = href;

                        if (href[0] == "/" && href[1] !== "/") {
                            hrefName = href
                            search1 = hrefName.search("/")
                            for (let j = search1; j < hrefName.length; j++) {
                                search1 = hrefName.search("/")
                                hrefName = hrefName.slice(search1 + 1)
                                j = search1 + 1
                                if (search1 === -1) {
                                    break
                                }
                            }

                            regex = [".", "=", "?", "/"]
                            for (let i = 0; i < regex.length; i++) {
                                replace_href = replace_href.replaceAll(regex[i], '\\' + String(regex[i]))
                            }

                            for (let i = 0; i < format.length; i++) {
                                if (format[i] == "woff") {
                                    if (hrefName.match("woff") && !hrefName.match("woff2")) {
                                        if (hrefName.slice(format[i].length) !== format[i]) {
                                            searchHrefNameSlice = hrefName.lastIndexOf(format[i])
                                            hrefName = hrefName.slice(0, searchHrefNameSlice)
                                            hrefName = hrefName + format[i]
                                        }
                                    } else {
                                        continue
                                    }
                                } else {
                                    if (hrefName.match(format[i])) {
                                        if (hrefName.slice(format[i].length) !== format[i]) {
                                            searchHrefNameSlice = hrefName.lastIndexOf(format[i])
                                            hrefName = hrefName.slice(0, searchHrefNameSlice)
                                            hrefName = hrefName + format[i]
                                        }
                                    }
                                }
                            }

                            hrefNameList.push(folderName + hrefName)
                            hrefLinkList.push(href)

                            console.log(format, hrefNameList)

                            search = response1.search(replace_href)
                            backward = response1.slice(0, search)
                            forward = response1.slice(search + href.length)
                            response1 = backward + folderName + hrefName + forward
                        }
                    }
                } else {
                    break
                }
            }
            if (callback) {
                return response1, callback
            }
        }
        Rip = Rip.bind(Rip)

        attribute = ["\.js", "\.png", "\.ico", "\.php", "\.gif", "\.woff", "\.woff2", "\.css", "\.html", "\.php", "\.asp", "\.svg"]
        Rip("<script", "src", ["\.js"], "js/", Rip)("<link", "href", ["\.png", "\.ico", "\.php", "\.gif", "\.woff2", "\.woff", "\.css", "\.svg", "\.png"], "css/")

    }).done(function () {
        for (let i = 0; i < hrefNameList.length; i++) {
            url = "http://" + link + hrefLinkList[i]

            settings1 = {
                "url": url,
                "method": "GET",
                "timeout": 0,
            };

            $.ajax(settings1).done(function (response2) {
                zip.file(hrefNameList[i], response2);
                d_count += 1
            }).done(function () {
                zip.file("index.html", response1)
                if (d_count == hrefNameList.length) {
                    zip.generateAsync({ type: "base64" }).then(function waitLoading(content) {
                        // $("body").append(("<button id='download' onClick='download()'>Download</button>"))
                        window.location.href = "data:application/zip;base64," + content
                    });
                }
            })
        }
    })
})