// Copyright (c) 2021 Neal Fultz. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
// this list of conditions and the following disclaimer.
//
// 2. Redistributions in other forms must reproduce the above copyright notice,
// this list of conditions and the following disclaimer in the documentation
// and/or other materials provided with the distribution.
//
// 3. All advertising materials mentioning features or use of this software
// must display the following acknowledgement: This product includes software
// developed by Neal Fultz <neal@njnm.co>.
//
// 4. Neither the name of Neal Fultz nor the names of its contributors may be
// used to endorse or promote products derived from this software without specific
// prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY Neal Fultz "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL Neal Fultz BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
// BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

function getExpand(command) {
    var ae = document.activeElement

    var l = ae.value.lastIndexOf(" ", ae.selectionStart - 1)
    var ret = ae.value.substring(l + 1, ae.selectionStart)

    //alert(`"${command}" executed on "${document.title}" : "${ret}"`);

    return ret;

}

function doExpand(expand) {
    var ae = document.activeElement;
    var i = ae.selectionStart;
    ae.value = ae.value.slice(0, i - expand.abbr.length) + expand.full + ae.value.slice(i);
}

function lookup(abbr, callback) {
  var dbo = indexedDB.open("posledniy");
  dbo.onerror = console.log;

  dbo.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction(["expand"], "readonly");
    var objectStore = transaction.objectStore("expand");
    var req = objectStore.get(abbr);
    req.onsuccess = function(event) {
        //console.log("lookup");
        //console.log(event);
        if(event.target.result) {
            callback(event.target.result)
        }
    }
  }

}

function saveExpand(text) {
  var i = text.indexOf(" ");
  var o = {
      abbr : text.slice(0, i),
      full : text.slice(i+1)
  }

  var dbo = indexedDB.open("posledniy");

  dbo.onsuccess = function(event) {
    var db = event.target.result;
    var transaction = db.transaction(["expand"], "readwrite");
    var objectStore = transaction.objectStore("expand");
    if (o.abbr == o.full) {
      var req = objectStore.delete(o.abbr);
    } else {
      var req = objectStore.put(o);
    }
    req.onsuccess = function(event) {
        console.log(event);
    }
  }

  //console.log('inputEntered: ' + text);

}

chrome.commands.onCommand.addListener(async function(command, tab) {
  let results = await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: getExpand,
    args: [command],
  });

  console.log(results);

  let abbr = results[0].result;
  if(abbr) {
      lookup(abbr, (full) => chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: doExpand,
        args: [full]
      })
      )
  }

});

chrome.omnibox.onInputEntered.addListener(saveExpand);


chrome.runtime.onInstalled.addListener(function(){
    // Let us open our database
    var DBOpenRequest = indexedDB.open("posledniy", 1);

    DBOpenRequest.onupgradeneeded = function(event) {
      var db = event.target.result;

      db.onerror = function(event) {
        console.log('Error loading database.');
        console.log(event);
      };

      // Create an objectStore for this database
      var objectStore = db.createObjectStore("expand", { keyPath: "abbr" });

      console.log("created")

    };

});
