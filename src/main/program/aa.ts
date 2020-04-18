const id = "";

function mediasString(medias:any) {
  return medias && Array.isArray(medias) ? (function(){
    const str = medias.map(function(item, index) {
      const type = item.type;
      if(type == "image") {
        return `<img src="${item.src}"/>`
      }else if(type == "video") {
        const ramdomString1 = (Math.random() * 10000000000).toFixed(0);
        const videoId = `video_${ramdomString1}`;
        
        return `<div>
          <video id="${videoId}" src="${item.src}" style="max-width:100%;"></video>
          <script>
            (function() {
              function sync(video, ...videos){
                var start = ${item.start || 0};
                videos.forEach(function(otherVideo) {
                  otherVideo.addEventListener("loadedmetadata", function() {
                    if(start > 0) {
                      otherVideo.currentTime = start;
                    }
                  }, false);
                  ${item.width ? "otherVideo.width = " + item.width + "px;" : ""}
                  ${item.height ? "otherVideo.width = " + item.height + "px;" : ""}
                });
                video.addEventListener("timeupdate", function() {
                  videos.forEach(function(otherVideo) {
                    if(Math.abs(Math.round(video.currentTime) - Math.round(otherVideo.currentTime)) > 0) {
                      if(otherVideo.duration >= video.currentTime) {
                        otherVideo.currentTime = video.currentTime;
                      }
                    }
                  });
                }, false);
                video.addEventListener("play", function() {
                  videos.forEach(function(otherVideo) {
                    if(otherVideo.paused) {
                      otherVideo.play();
                    }
                  });
                }, false);
                video.addEventListener("pause", function() {
                  videos.forEach(function(otherVideo) {
                    if(!otherVideo.paused) {
                      otherVideo.pause();
                    }
                  });
                }, false);
                video.addEventListener("ratechange", function() {
                  videos.forEach(function(otherVideo) {
                    otherVideo.playbackRate = video.playbackRate;
                  });
                }, false);
                video.addEventListener("seeking", function() {
                  videos.forEach(function(otherVideo) {
                    otherVideo.currentTime = video.currentTime;
                  });
                }, false);
                videos.forEach(function(otherVideo) {
                  otherVideo.addEventListener("play", function() {
                    if(video.paused) {
                      otherVideo.pause();
                    }
                  }, false);
                  otherVideo.addEventListener("pause", function() {
                    if(!video.paused) {
                      otherVideo.play();
                    }
                  }, false);
                  // otherVideo.addEventListener("seeking", function() {
                  //   console.log("seeking")
                  //   otherVideo.currentTime = video.currentTime;
                  // }, false);
                  // otherVideo.addEventListener("ratechange", function() {
                  //   otherVideo.playbackRate = video.playbackRate;
                  // }, false);
                });
              }
              sync(document.querySelector("#${id}"), document.querySelector("#${videoId}"));
            })();
          </script>
        </div>`;
      }else if(type == "pdf") {
        const ramdomString1 = (Math.random() * 10000000000).toFixed(0);
        const canvasId = `canvas_${ramdomString1}`;
        return `<p>
          <canvas id="${canvasId}" style="max-width: 100%;"></canvas>
          <script>
          if(pdfjsLib) {
            pdfjsLib.getDocument("${item.src}").promise.then(function(res){
              res.getPage(${item.page || 1}).then(function(page) {
                var scale = 1.0;
                var viewport = page.getViewport({ scale: scale, });
                
                var canvas = document.getElementById('${canvasId}');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                var renderContext = {
                  canvasContext: context,
                  viewport: viewport
                };
                page.render(renderContext);
            });});
          }
          </script>
        </p>`;
      }else if(type == "docs") {
        const ramdomString1 = (Math.random() * 10000000000).toFixed(0);
        const docsId = `docs_${ramdomString1}`;
        return `<p>
          <p id="${docsId}"></p>
          <script>
          (function(){
            if(!mammoth) {
              return;
            }
            var blob = null;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "${item.src}");
            xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
            xhr.onload = function() {
                blob = xhr.response; //xhr.response is now a blob object
                var myReader = new FileReader();
                myReader.readAsArrayBuffer(blob)
                myReader.addEventListener("loadend", function(e) {
                    var buffer = e.srcElement.result; //arraybuffer object
                    mammoth.convertToHtml({
                            arrayBuffer: buffer
                        })
                        .then(function(result) {
                          var html = result.value;
                          document.querySelector("#${docsId}").innerHTML = html;
                        })
                        .done();
                });
            }
            xhr.send();
          })();
          </script>
        </p>`;
      }else if(type == "txt") {
        const ramdomString1 = (Math.random() * 10000000000).toFixed(0);
        const txtId = `txt_${ramdomString1}`;
        return `<p>
          <p id="${txtId}"></p>
          <script>
          (function(){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "${item.src}");
            xhr.onload = function() {
              var content = xhr.response;
              document.querySelector("#${txtId}").innerHTML = content;
            }
            xhr.send();
          })();
          </script>
        </p>`;
      }else if(type == "md") {
        const ramdomString1 = (Math.random() * 10000000000).toFixed(0);
        const mdId = `md_${ramdomString1}`;
        return `<p>
          <p id="${mdId}"></p>
          <script>
          (function(){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "${item.src}");
            xhr.onload = function() {
              var content = xhr.response;
              document.querySelector("#${mdId}").innerHTML = marked(content);
            }
            xhr.send();
          })();
          </script>
        </p>`;
      }
      return '';
    }).join("");
    return `
    <div style="max-width: 90%;max-height: 80%;left:5%;top: 5%;overflow-y: scroll;">
    ${str}
    </div>
    `;
  })() : '';
}