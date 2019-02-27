var allNodes = [];
var imgNodes = [];
var textNodes = [];
let flag = true;
let allNodesLength;
let currentNode;

function startSegmentation(win) {
  contentWindow = win;
  contentDocument = contentWindow.document;
  var root = contentDocument.getElementsByTagName("BODY")[0];
  findAllNodes(contentDocument);
  gatherAllTextNodes(contentDocument);

  // console.log(allNodes);

  for (let i = 0; i < allNodes.length; i++) {

    let modal = document.createElement("DIV");
    modal.setAttribute("id", allNodes[i]['id']);
    modal.setAttribute("class", "myModal");
    let modalContent = "";
    for (let [key, value] of Object.entries(allNodes[i])) {
      if (key.substring(0, 2) == "is") {
        let val = (value == 1) ? "checked" : "";
        modalContent += "<span><p>" + key + "</p>" + "<input type='checkbox' value='" + value + "' class='node_" + key + "' " + val + " >";
      } else
        modalContent += "<span><p>" + key + "</p>" + "<input type='text' value='" + value + "'  class='node_" + key + "'>";
    }
    modal.innerHTML = `<div class="modal-header"></div><div class="modal-content">` + modalContent + `</div><div><button onclick='nextNode()' id='nextNode'>Next</button></div>`;
    modal.style.cssText = `border:1px solid #000;display:none;position:absolute;left:25vw; top:50px;border-radius:5px;z-index: 2000000;`;
    document.body.appendChild(modal);
    document.getElementsByClassName('modal-content')[0].style.cssText = `background-color: #fefefe;padding: 20px;max-height:200px;overflow-y:auto;border: 1px solid #888;`;
    document.getElementById('nextNode').style.cssText = `font-weight: bold;font-size: 15px;width: 100%;cursor: pointer;background: #444444;border: 0;height: 30px;color: white;`;
    document.getElementsByClassName('modal-header')[0].style.cssText = `height:30px;background-color:#444;color:#ddd;cursor:pointer;`;
  }


  let overlay = document.createElement("DIV");
  overlay.setAttribute("id", "overlay");
  document.body.appendChild(overlay);

  $(".myModal").draggable();

  currentNode = 0;
  allNodesLength = allNodes.length;
  // console.log(allNodes[currentNode]['id']);
  document.getElementById(allNodes[currentNode]['id']).style.display = "block";
  let w = allNodes[currentNode]['width'] + 20;
  let h = allNodes[currentNode]['height'] + 20;
  let t = allNodes[currentNode]['top'] - 10;
  let l = allNodes[currentNode]['left'] - 10;

  let overlayCSS = `position: fixed; display: block; width: ` + w + `px; height: ` + h + `px; top: ` + t + `px; left: ` + l + `px;background-color: rgba(255,69,0,0.5); z-index: 1000000; cursor: pointer; `;
  overlay.style.cssText = overlayCSS;

}

function nextNode() {
  for (let [key, value] of Object.entries(allNodes[currentNode])) {
    if (key.substring(0, 2) == "is") {
      if ($("#" + allNodes[currentNode]["id"] + " .node_" + key).prop('checked') == true)
        allNodes[currentNode][key] = 1;
      else
        allNodes[currentNode][key] = 0;
    } else
      allNodes[currentNode][key] = $("#" + allNodes[currentNode]["id"] + " .node_" + key).val();
  }

  $("#" + allNodes[currentNode]['id']).remove();


  if (currentNode + 1 < allNodesLength) {
    currentNode++;
    // console.log(allNodes[currentNode]['id']);
    let currentModal = document.getElementById(allNodes[currentNode]['id'])
    currentModal.style.cssText = `border:1px solid #000;display:block;position:absolute;left:25vw; top:50px;border-radius:5px;z-index: 2000000;`;

    document.getElementsByClassName('modal-content')[0].style.cssText = `background-color: #fefefe;padding: 20px;max-height:200px;overflow-y:auto;border: 1px solid #888;`;
    document.getElementById('nextNode').style.cssText = `font-weight: bold;font-size: 15px;width: 100%;cursor: pointer;background: #444444;border: 0;height: 30px;color: white;`;
    document.getElementsByClassName('modal-header')[0].style.cssText = `height:30px;background-color:#444;color:#ddd;cursor:pointer;`;
    let overlay = document.getElementById('overlay');
    let w = allNodes[currentNode]['width'] + 20;
    let h = allNodes[currentNode]['height'] + 20;
    let t = allNodes[currentNode]['top'] - 10;
    let l = allNodes[currentNode]['left'] - 10;

    let overlayCSS = `position: fixed; display: block; width: ` + w + `px; height: ` + h + `px; top: ` + t + `px; left: ` + l + `px;background-color: rgba(255,69,0,0.5); z-index: 1000000; cursor: pointer; `;
    overlay.style.cssText = overlayCSS;

    // window.scrollTo(allNodes[currentNode]['left']+allNodes[currentNode]['width'], allNodes[currentNode]['top']+allNodes[currentNode]['height']);
    // console.log(l + w)
    // console.log(h + t)
    // document.scrollLeft = l + w;
    // document.scrollTop = h + t;
    $(document.body).animate({
      'scrollTop': h + t
    }, 2000);
    $(document.body).animate({
      'scrollLeft': l + w
    }, 2000);
  } else {
    flag = false;
    let final = buildJSONData();
    contentWindow.writetodisk(final);
  }
}

function findAllNodes(obj) {
  if (!obj) return;

  var block = "";

  if (obj.tagName && !isHidden(obj)) {
    if (obj.tagName.toLowerCase() == "a") {
      markTextNodeVisisted(obj);
      linkNode = getLinkNode(obj);
      if (linkNode != null) {
        allNodes.push(linkNode);
      }
    } else if (
      obj.tagName.toLowerCase() != "input" &&
      (obj.tagName.toLowerCase() == "img" ||
        $(obj).css("background-image") != "none")
    ) {
      markTextNodeVisisted(obj);
      imgNode = getImgNode(obj);
      if (imgNode != null) {
        allNodes.push(imgNode);
      }
    } else if (obj.tagName.toLowerCase() == "input") {
      markTextNodeVisisted(obj);
      inputNode = getInputNode(obj);
      if (inputNode != null) {
        allNodes.push(inputNode);
      }
    }
  }

  var n = obj.childNodes.length;
  for (var i = 0; i < n; i++) {
    var child = obj.childNodes[i];
    findAllNodes(child);
  }
}

function buildJSONData() {
  var mainBlock = {
    url: document.URL,
    title: document.title,
    nodes: allNodes
  };

  return JSON.stringify(mainBlock, null, 2);
}

function isHidden(el) {
  var style = contentWindow.getComputedStyle(el);
  return style.display === "none";
}

function markTextNodeVisisted(obj) {
  var n,
    walk = document.createTreeWalker(obj, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) {
    n.parentNode.setAttribute("visited", true);
  }
}

function gatherAllTextNodes(obj) {
  var n,
    walk = document.createTreeWalker(obj, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) {
    if (
      n.data.trim().length != 0 &&
      n.parentNode.tagName &&
      n.parentNode.tagName.toLowerCase() != "a" &&
      n.parentNode.tagName.toLowerCase() != "img" &&
      n.parentNode.nodeName != "SCRIPT" &&
      n.parentNode.nodeName != "INPUT" &&
      !n.parentNode.getAttribute("visited")
    ) {
      var label = n.data;
      var xpath = getXPath(n.parentNode);
      var tagType = n.parentNode.tagName;
      var parentXpath = getXPath(n.parentNode.parentNode);
      var fontSize = parseFloat(
        contentWindow
        .getComputedStyle(n.parentNode, null)
        .getPropertyValue("font-size")
      );
      var fontWeight = parseFloat(
        contentWindow
        .getComputedStyle(n.parentNode, null)
        .getPropertyValue("font-weight")
      );
      var fontColor = contentWindow
        .getComputedStyle(n.parentNode, null)
        .getPropertyValue("color");

      var alpha = 1;

      if (fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
        rgb = fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      } else if (
        fontColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/)
      ) {
        rgb = fontColor.match(
          /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/
        );
        alpha = rgb[4];
      }
      var id = MD5(xpath);

      var top = $(n.parentNode).offset().top;
      var left = $(n.parentNode).offset().left;
      var width = $(n.parentNode).width();
      var height = $(n.parentNode).height();

      if (top == 0 && left == 0) {
        continue;
      }

      if (width == 0 && height == 0) {
        continue;
      }

      if (top < 0 || left < 0) {
        continue;
      }

      var textNode = {
        id: id,
        isSPAN: getTagEncodedValue(tagType.toLowerCase(), "span"),
        isLI: getTagEncodedValue(tagType.toLowerCase(), "li"),
        isDT: getTagEncodedValue(tagType.toLowerCase(), "dt"),
        isDD: getTagEncodedValue(tagType.toLowerCase(), "dd"),
        isH1: getTagEncodedValue(tagType.toLowerCase(), "h1"),
        isH2: getTagEncodedValue(tagType.toLowerCase(), "h2"),
        isH3: getTagEncodedValue(tagType.toLowerCase(), "h3"),
        isH4: getTagEncodedValue(tagType.toLowerCase(), "h4"),
        isH5: getTagEncodedValue(tagType.toLowerCase(), "h5"),
        isINS: getTagEncodedValue(tagType.toLowerCase(), "ins"),
        isBUTTON: getTagEncodedValue(tagType.toLowerCase(), "button"),
        isINPUT: getTagEncodedValue(tagType.toLowerCase(), "input"),
        isP: getTagEncodedValue(tagType.toLowerCase(), "p"),
        isI: getTagEncodedValue(tagType.toLowerCase(), "i"),
        isIMG: getTagEncodedValue(tagType.toLowerCase(), "img"),
        isA: getTagEncodedValue(tagType.toLowerCase(), "a"),
        tag: tagType,
        label: label,
        xpath: xpath,
        parentxpath: parentXpath,
        left: left,
        top: top,
        width: width,
        height: height,
        fontsize: fontSize,
        fontweight: fontWeight,
        fontMeanColorR: parseFloat(rgb[1]),
        fontMeanColorG: parseFloat(rgb[2]),
        fontMeanColorB: parseFloat(rgb[3]),
        fontalpha: alpha,
        href: "",
        imgsrc: "",
        isLogo: 0,
        isCTA: 0,
        isCTAMain: 0,
        isLogin: 0,
        isSignUp: 0,
        isHeroText: 0,
        isHeroImg: 0,
        isValuePropText: 0,
        isValuePropImg: 0,
        isIllustration: 0,
        isProductDemoImg: 0,
        isNavigation: 0,
        isContact: 0,
        isSocialMedia: 0,
        isFooterLink: 0
      };
      allNodes.push(textNode);
    }
  }
}

function getTagEncodedValue(tagName, comparision) {
  if (tagName == comparision) {
    return 1;
  } else {
    return 0;
  }
}

function getImgNode(obj) {
  var img = obj;
  var tag = obj.tagName;
  var label = img.getAttribute("alt");
  var imgsrc = img.src;
  if (!imgsrc) {
    imgsrc = $(img).prop("srcset");
  }
  if (!imgsrc) {
    var url = $(img).css("background-image");
    imgsrc = url.substring(4, url.length - 1).replace(/['"]+/g, "");
  }

  var xpath = getXPath(img);
  var id = MD5(xpath);
  var parentXpath = getXPath(img.parentNode);

  var top = $(img).offset().top;
  var left = $(img).offset().left;
  var width = $(img).width();
  var height = $(img).height();

  if (top == 0 && left == 0 && width == 0 && height == 0) {
    return null;
  }

  if (width == 0 && height == 0) {
    return null;
  }

  if (top < 0 || left < 0) {
    return null;
  }

  var alpha = 1;

  var imgNode = {
    id: id,
    isSPAN: 0,
    isLI: 0,
    isDT: 0,
    isDD: 0,
    isH1: 0,
    isH2: 0,
    isH3: 0,
    isH4: 0,
    isH5: 0,
    isINS: 0,
    isBUTTON: 0,
    isINPUT: 0,
    isP: 0,
    isI: 0,
    isIMG: 1,
    isA: 0,
    tag: tag,
    label: label,
    xpath: xpath,
    parentxpath: parentXpath,
    left: left,
    top: top,
    width: width,
    height: height,
    fontsize: 0,
    fontweight: 0,
    fontMeanColorR: 0,
    fontMeanColorG: 0,
    fontMeanColorB: 0,
    fontalpha: alpha,
    href: "",
    imgsrc: imgsrc,
    isLogo: 0,
    isCTA: 0,
    isCTAMain: 0,
    isLogin: 0,
    isSignUp: 0,
    isHeroText: 0,
    isHeroImg: 0,
    isValuePropText: 0,
    isValuePropImg: 0,
    isIllustration: 0,
    isProductDemoImg: 0,
    isNavigation: 0,
    isContact: 0,
    isSocialMedia: 0,
    isFooterLink: 0
  };
  return imgNode;
}

function getLinkNode(obj) {
  var link = obj;
  var label = $(link).text();
  var xpath = getXPath(link);
  var parentXpath = getXPath(link.parentNode);

  var fontSize = parseFloat(
    contentWindow.getComputedStyle(link, null).getPropertyValue("font-size")
  );
  var fontWeight = parseFloat(
    contentWindow.getComputedStyle(link, null).getPropertyValue("font-weight")
  );
  var fontColor = contentWindow
    .getComputedStyle(link, null)
    .getPropertyValue("color");

  var alpha = 1;

  if (fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
    rgb = fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  } else if (
    fontColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/)
  ) {
    rgb = fontColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/);
    alpha = rgb[4];
  }

  var top = $(link).offset().top;
  var left = $(link).offset().left;
  var width = $(link).width();
  var height = $(link).height();

  var href = $(link).prop("href");
  var id = MD5(xpath);

  if (top == 0 && left == 0) {
    return null;
  }

  if (width == 0 && height == 0) {
    return null;
  }

  if (top < 0 || left < 0) {
    return null;
  }

  var linkNode = {
    id: id,
    isSPAN: 0,
    isLI: 0,
    isDT: 0,
    isDD: 0,
    isH1: 0,
    isH2: 0,
    isH3: 0,
    isH4: 0,
    isH5: 0,
    isINS: 0,
    isBUTTON: 0,
    isINPUT: 0,
    isP: 0,
    isI: 0,
    isIMG: 0,
    isA: 1,
    tag: "A",
    label: label,
    xpath: xpath,
    parentxpath: parentXpath,
    left: left,
    top: top,
    width: width,
    height: height,
    fontsize: fontSize,
    fontweight: fontWeight,
    fontMeanColorR: parseFloat(rgb[1]),
    fontMeanColorG: parseFloat(rgb[2]),
    fontMeanColorB: parseFloat(rgb[3]),
    fontalpha: alpha,
    href: href,
    imgsrc: "",
    isLogo: 0,
    isCTA: 0,
    isCTAMain: 0,
    isLogin: 0,
    isSignUp: 0,
    isHeroText: 0,
    isHeroImg: 0,
    isValuePropText: 0,
    isValuePropImg: 0,
    isIllustration: 0,
    isProductDemoImg: 0,
    isNavigation: 0,
    isContact: 0,
    isSocialMedia: 0,
    isFooterLink: 0
  };
  return linkNode;
}

function getInputNode(obj) {
  var link = obj;
  var label = $(link).prop("value");
  var xpath = getXPath(link);
  var parentXpath = getXPath(link.parentNode);

  var fontSize = parseFloat(
    contentWindow.getComputedStyle(link, null).getPropertyValue("font-size")
  );
  var fontWeight = parseFloat(
    contentWindow.getComputedStyle(link, null).getPropertyValue("font-weight")
  );
  var fontColor = contentWindow
    .getComputedStyle(link, null)
    .getPropertyValue("color");

  var alpha = 1;

  if (fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
    rgb = fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  } else if (
    fontColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/)
  ) {
    rgb = fontColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*((0.)?\d+)\)$/);
    alpha = rgb[4];
  }

  var top = $(link).offset().top;
  var left = $(link).offset().left;
  var width = $(link).width();
  var height = $(link).height();

  var href = $(link).prop("href");
  var id = MD5(xpath);

  if (top == 0 && left == 0) {
    return null;
  }

  if (width == 0 && height == 0) {
    return null;
  }

  if (top < 0 || left < 0) {
    return null;
  }

  var inputNode = {
    id: id,
    isSPAN: 0,
    isLI: 0,
    isDT: 0,
    isDD: 0,
    isH1: 0,
    isH2: 0,
    isH3: 0,
    isH4: 0,
    isH5: 0,
    isINS: 0,
    isBUTTON: 0,
    isINPUT: 1,
    isP: 0,
    isI: 0,
    isIMG: 0,
    isA: 1,
    tag: "INPUT",
    label: label,
    xpath: xpath,
    parentxpath: parentXpath,
    left: left,
    top: top,
    width: width,
    height: height,
    fontsize: fontSize,
    fontweight: fontWeight,
    fontMeanColorR: parseFloat(rgb[1]),
    fontMeanColorG: parseFloat(rgb[2]),
    fontMeanColorB: parseFloat(rgb[3]),
    fontalpha: alpha,
    href: href,
    imgsrc: "",
    isLogo: 0,
    isCTA: 0,
    isCTAMain: 0,
    isLogin: 0,
    isSignUp: 0,
    isHeroText: 0,
    isHeroImg: 0,
    isValuePropText: 0,
    isValuePropImg: 0,
    isIllustration: 0,
    isProductDemoImg: 0,
    isNavigation: 0,
    isContact: 0,
    isSocialMedia: 0,
    isFooterLink: 0
  };
  return inputNode;
}

function getXPathOld(elt) {
  var path = "";
  for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
    idx = getElementIdx(elt);
    xname = elt.tagName;
    if (idx > 1) xname += "[" + idx + "]";
    path = "/" + xname + path;
  }
  return path.toLowerCase();
}

function getXPath(element) {
  if (element.parentNode == null) return
  if (element.id !== "") return 'id("' + element.id + '")';
  if (element === document.documentElement) return element.tagName;

  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === element)
      return (
        getXPath(element.parentNode) +
        "/" +
        element.tagName +
        "[" +
        (ix + 1) +
        "]"
      );
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
  }
}

/* auxiliar function of xpath one*/
function getElementIdx(elt) {
  var count = 1;
  for (var sib = elt.previousSibling; sib; sib = sib.previousSibling) {
    if (sib.nodeType == 1 && sib.tagName == elt.tagName) count++;
  }

  return count;
}

function MD5(d) {
  result = M(V(Y(X(d), 8 * d.length)));
  return result.toLowerCase();
}

function M(d) {
  for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++)
    (_ = d.charCodeAt(r)), (f += m.charAt((_ >>> 4) & 15) + m.charAt(15 & _));
  return f;
}

function X(d) {
  for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
  for (m = 0; m < 8 * d.length; m += 8)
    _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
  return _;
}

function V(d) {
  for (var _ = "", m = 0; m < 32 * d.length; m += 8)
    _ += String.fromCharCode((d[m >> 5] >>> m % 32) & 255);
  return _;
}

function Y(d, _) {
  (d[_ >> 5] |= 128 << _ % 32), (d[14 + (((_ + 64) >>> 9) << 4)] = _);
  for (
    var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16
  ) {
    var h = m,
      t = f,
      g = r,
      e = i;
    (f = md5_ii(
      (f = md5_ii(
        (f = md5_ii(
          (f = md5_ii(
            (f = md5_hh(
              (f = md5_hh(
                (f = md5_hh(
                  (f = md5_hh(
                    (f = md5_gg(
                      (f = md5_gg(
                        (f = md5_gg(
                          (f = md5_gg(
                            (f = md5_ff(
                              (f = md5_ff(
                                (f = md5_ff(
                                  (f = md5_ff(
                                    f,
                                    (r = md5_ff(
                                      r,
                                      (i = md5_ff(
                                        i,
                                        (m = md5_ff(
                                          m,
                                          f,
                                          r,
                                          i,
                                          d[n + 0],
                                          7,
                                          -680876936
                                        )),
                                        f,
                                        r,
                                        d[n + 1],
                                        12,
                                        -389564586
                                      )),
                                      m,
                                      f,
                                      d[n + 2],
                                      17,
                                      606105819
                                    )),
                                    i,
                                    m,
                                    d[n + 3],
                                    22,
                                    -1044525330
                                  )),
                                  (r = md5_ff(
                                    r,
                                    (i = md5_ff(
                                      i,
                                      (m = md5_ff(
                                        m,
                                        f,
                                        r,
                                        i,
                                        d[n + 4],
                                        7,
                                        -176418897
                                      )),
                                      f,
                                      r,
                                      d[n + 5],
                                      12,
                                      1200080426
                                    )),
                                    m,
                                    f,
                                    d[n + 6],
                                    17,
                                    -1473231341
                                  )),
                                  i,
                                  m,
                                  d[n + 7],
                                  22,
                                  -45705983
                                )),
                                (r = md5_ff(
                                  r,
                                  (i = md5_ff(
                                    i,
                                    (m = md5_ff(
                                      m,
                                      f,
                                      r,
                                      i,
                                      d[n + 8],
                                      7,
                                      1770035416
                                    )),
                                    f,
                                    r,
                                    d[n + 9],
                                    12,
                                    -1958414417
                                  )),
                                  m,
                                  f,
                                  d[n + 10],
                                  17,
                                  -42063
                                )),
                                i,
                                m,
                                d[n + 11],
                                22,
                                -1990404162
                              )),
                              (r = md5_ff(
                                r,
                                (i = md5_ff(
                                  i,
                                  (m = md5_ff(
                                    m,
                                    f,
                                    r,
                                    i,
                                    d[n + 12],
                                    7,
                                    1804603682
                                  )),
                                  f,
                                  r,
                                  d[n + 13],
                                  12,
                                  -40341101
                                )),
                                m,
                                f,
                                d[n + 14],
                                17,
                                -1502002290
                              )),
                              i,
                              m,
                              d[n + 15],
                              22,
                              1236535329
                            )),
                            (r = md5_gg(
                              r,
                              (i = md5_gg(
                                i,
                                (m = md5_gg(
                                  m,
                                  f,
                                  r,
                                  i,
                                  d[n + 1],
                                  5,
                                  -165796510
                                )),
                                f,
                                r,
                                d[n + 6],
                                9,
                                -1069501632
                              )),
                              m,
                              f,
                              d[n + 11],
                              14,
                              643717713
                            )),
                            i,
                            m,
                            d[n + 0],
                            20,
                            -373897302
                          )),
                          (r = md5_gg(
                            r,
                            (i = md5_gg(
                              i,
                              (m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691)),
                              f,
                              r,
                              d[n + 10],
                              9,
                              38016083
                            )),
                            m,
                            f,
                            d[n + 15],
                            14,
                            -660478335
                          )),
                          i,
                          m,
                          d[n + 4],
                          20,
                          -405537848
                        )),
                        (r = md5_gg(
                          r,
                          (i = md5_gg(
                            i,
                            (m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438)),
                            f,
                            r,
                            d[n + 14],
                            9,
                            -1019803690
                          )),
                          m,
                          f,
                          d[n + 3],
                          14,
                          -187363961
                        )),
                        i,
                        m,
                        d[n + 8],
                        20,
                        1163531501
                      )),
                      (r = md5_gg(
                        r,
                        (i = md5_gg(
                          i,
                          (m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467)),
                          f,
                          r,
                          d[n + 2],
                          9,
                          -51403784
                        )),
                        m,
                        f,
                        d[n + 7],
                        14,
                        1735328473
                      )),
                      i,
                      m,
                      d[n + 12],
                      20,
                      -1926607734
                    )),
                    (r = md5_hh(
                      r,
                      (i = md5_hh(
                        i,
                        (m = md5_hh(m, f, r, i, d[n + 5], 4, -378558)),
                        f,
                        r,
                        d[n + 8],
                        11,
                        -2022574463
                      )),
                      m,
                      f,
                      d[n + 11],
                      16,
                      1839030562
                    )),
                    i,
                    m,
                    d[n + 14],
                    23,
                    -35309556
                  )),
                  (r = md5_hh(
                    r,
                    (i = md5_hh(
                      i,
                      (m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060)),
                      f,
                      r,
                      d[n + 4],
                      11,
                      1272893353
                    )),
                    m,
                    f,
                    d[n + 7],
                    16,
                    -155497632
                  )),
                  i,
                  m,
                  d[n + 10],
                  23,
                  -1094730640
                )),
                (r = md5_hh(
                  r,
                  (i = md5_hh(
                    i,
                    (m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174)),
                    f,
                    r,
                    d[n + 0],
                    11,
                    -358537222
                  )),
                  m,
                  f,
                  d[n + 3],
                  16,
                  -722521979
                )),
                i,
                m,
                d[n + 6],
                23,
                76029189
              )),
              (r = md5_hh(
                r,
                (i = md5_hh(
                  i,
                  (m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487)),
                  f,
                  r,
                  d[n + 12],
                  11,
                  -421815835
                )),
                m,
                f,
                d[n + 15],
                16,
                530742520
              )),
              i,
              m,
              d[n + 2],
              23,
              -995338651
            )),
            (r = md5_ii(
              r,
              (i = md5_ii(
                i,
                (m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844)),
                f,
                r,
                d[n + 7],
                10,
                1126891415
              )),
              m,
              f,
              d[n + 14],
              15,
              -1416354905
            )),
            i,
            m,
            d[n + 5],
            21,
            -57434055
          )),
          (r = md5_ii(
            r,
            (i = md5_ii(
              i,
              (m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571)),
              f,
              r,
              d[n + 3],
              10,
              -1894986606
            )),
            m,
            f,
            d[n + 10],
            15,
            -1051523
          )),
          i,
          m,
          d[n + 1],
          21,
          -2054922799
        )),
        (r = md5_ii(
          r,
          (i = md5_ii(
            i,
            (m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359)),
            f,
            r,
            d[n + 15],
            10,
            -30611744
          )),
          m,
          f,
          d[n + 6],
          15,
          -1560198380
        )),
        i,
        m,
        d[n + 13],
        21,
        1309151649
      )),
      (r = md5_ii(
        r,
        (i = md5_ii(
          i,
          (m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070)),
          f,
          r,
          d[n + 11],
          10,
          -1120210379
        )),
        m,
        f,
        d[n + 2],
        15,
        718787259
      )),
      i,
      m,
      d[n + 9],
      21,
      -343485551
    )),
    (m = safe_add(m, h)),
    (f = safe_add(f, t)),
    (r = safe_add(r, g)),
    (i = safe_add(i, e));
  }
  return Array(m, f, r, i);
}

function md5_cmn(d, _, m, f, r, i) {
  return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
}

function md5_ff(d, _, m, f, r, i, n) {
  return md5_cmn((_ & m) | (~_ & f), d, _, r, i, n);
}

function md5_gg(d, _, m, f, r, i, n) {
  return md5_cmn((_ & f) | (m & ~f), d, _, r, i, n);
}

function md5_hh(d, _, m, f, r, i, n) {
  return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
}

function md5_ii(d, _, m, f, r, i, n) {
  return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
}

function safe_add(d, _) {
  var m = (65535 & d) + (65535 & _);
  return (((d >> 16) + (_ >> 16) + (m >> 16)) << 16) | (65535 & m);
}

function bit_rol(d, _) {
  return (d << _) | (d >>> (32 - _));
}