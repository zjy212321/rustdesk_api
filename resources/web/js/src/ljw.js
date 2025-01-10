window._gwen = {}
window._gwen.kv = {}
const apiserver = localStorage.getItem('api-server')

function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }

    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}

function getQueryVariable() {
    const query = window.location.hash.substring(3);
    const vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        window._gwen.kv[pair[0]] = pair[1]
    }
}

getQueryVariable()

const id = window._gwen.kv.id || ''
if (id) {
    localStorage.setItem('remote-id', id)
}
const share_token = window._gwen.kv.share_token || ''
if (share_token) {
    fetch(apiserver + "/api/shared-peer", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({share_token})
    }).then(res => res.json()).then(res => {
        if (res.code === 0) {
            localStorage.setItem('custom-rendezvous-server', res.data.id_server)
            localStorage.setItem('key', res.data.key)
            const peer = res.data.peer
            localStorage.setItem('remote-id', peer.info.id)
            peer.tmppwd = stringToUint8Array(window.atob(peer.tmppwd)).toString()
            const oldPeers = JSON.parse(localStorage.getItem('peers')) || {}
            oldPeers[peer.info.id] = peer
            localStorage.setItem('peers', JSON.stringify(oldPeers))
        }
    })
}

let fetching = false
export function getServerConf(token){
    console.log('getServerConf', token)
    if(fetching){
        return
    }
    fetching = true
    fetch(apiserver + "/api/server-config", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
    ).then(res => res.json()).then(res => {
        fetching = false
        if (res.code === 0) {
            if (!localStorage.getItem('custom-rendezvous-server') || !localStorage.getItem('key')) {
                localStorage.setItem('custom-rendezvous-server', res.data.id_server)
                localStorage.setItem('key', res.data.key)
            }
            if (res.data.peers) {
                const oldPeers = JSON.parse(localStorage.getItem('peers')) || {}
                let needUpdate = false
                Object.keys(res.data.peers).forEach(k => {
                    if (!oldPeers[k]) {
                        oldPeers[k] = res.data.peers[k]
                        needUpdate = true
                    } else {
                        oldPeers[k].info = res.data.peers[k].info
                    }
                    if (oldPeers[k].info && oldPeers[k].info.hash && !oldPeers[k].password) {
                        let p1 = window.atob(oldPeers[k].info.hash)
                        const pwd = stringToUint8Array(p1)
                        oldPeers[k].password = pwd.toString()
                        oldPeers[k].remember = true
                    }
                })
                localStorage.setItem('peers', JSON.stringify(oldPeers))
                if (needUpdate) {
                    window.location.reload()
                }
            }
        }
    }).catch(_ => {
        fetching = false
    })
}
