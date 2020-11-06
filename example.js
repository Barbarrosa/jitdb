const FlumeLog = require('async-flumelog')
const pull = require('pull-stream')
const Obv = require('obv')

//const { query, filter } = require('./query')

const t = require("./query2")

const author = '@+UMKhpbzXAII+2/7ZlsgkJwIsxdfeFi36Z5Rk1gCfY0=.ed25519'

var raf = FlumeLog(process.argv[2], {blockSize: 64*1024})

var db = require('./index')(raf, "./indexes")
db.onReady(async () => {
  // seems the cache needs to be warmed up to get fast results

  const mix = '@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519'
  const mixy = '@G98XybiXD/amO9S/UyBKnWTWZnSKYS3YVB/5osSRHvY=.ed25519'
  const arj = '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'

  // FIXME: add offset to all
  // FIXME: support multiple with AND/OR

  if (false) t.query(
    t.fromDB(db),
    // t.debug(),
    t.and(t.type('post')),
    // t.debug(),
    t.or(t.author(mix), t.author(mixy), t.author(arj)),
    // t.debug(),
    t.paginate(100),
    // t.debug(),
    t.toCallback((err, results) => {
      // console.log(results.data)
      console.log(results.total)
      //console.log(results.map(x => x.value))
    })
  )

  if (false) {
    const results = await t.query(
      t.fromDB(db),
      // t.debug(),
      t.and(t.type('post')),
      // t.debug(),
      t.or(t.author(mix), t.author(mixy), t.author(arj)),
      // t.debug(),
      t.toPromise(),
    );
    console.log(results);
  }

  var i = 0;
  if (false) pull(
    t.query(
      t.fromDB(db),
      // t.debug(),
      t.and(t.type('blog')),
      // t.debug(),
      t.or(t.author(mix), t.author(mixy), t.author(arj)),
      // t.debug(),
      t.paginate(3),
      // t.debug(),
      t.toPullStream(),
    ),
    pull.drain(msgs => {
      console.log('page #' + (i++))
      console.log((msgs))
    })
  )

  var i = 0;
  if (true) {
    const results = t.query(
      t.fromDB(db),
      // t.debug(),
      t.and(t.type('blog')),
      // t.debug(),
      t.or(t.author(mix), t.author(mixy), t.author(arj)),
      // t.debug(),
      t.paginate(3),
      // t.debug(),
      t.toAsyncIter(),
    )
    for await (let msgs of results) {
      console.log('page #' + (i++))
      console.log(msgs)
    }
  }

  return

  //var q = query(db, filter.author('mixy'))
  var q = query(db, filter.type('post'))
  //q = q.AND(filter.author(mixy))
  q = q.AND(filter.channel("solarpunk"))
  q = q.AND(filter.OR([
    filter.author(mix),
    filter.author(mixy)
  ]))

  console.log(JSON.stringify(q.op, null, 2))

  q.all((err, msgs) => {
    console.log(msgs.length)
  })

  return

  //console.log(JSON.stringify(q.op, null, 2))

  q.paginate(0, 10, (err, msgs, paginator) => {
    console.log(paginator)
    console.log(msgs.length)
    paginator.next((err, msgs) => {
      console.log(msgs.length)
      paginator.next((err, msgs) => {
        console.log(msgs.length)
        console.log(paginator)
      })
    })
  })

  return

  //{ type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } }

  db.query({
    type: 'DATA',
    offsets: [108008,1386944,335929,635308,630114,360712,993930,219987,619953,754087,6542,712682,251290,1041885,612945,245983,263040,192810,316896,995383,252096,648502,988358,247233,751471,181798,1068302,637827,645701,457733,646747,682271,6405,195927,626189,278702,724741,633847,79158,645273,444567,277931,647863,1006864,841437,145025,640188,749901,940035,827283,656095,1026279,19254,684531,645334,1089701,618074,624312,319970,374225,612069,314723,687725,1243066,208477,341348,628657,995381,40129,12849,332477,676639,1191000,92919,1048083,317659,5493,643820,979257,611027,677762,642232,319192,618980,643798,644516,251020,343379,617883,275455,257338,630553,320148,712818,1056847,627194,348845,1377308,639520,191037,1000473,864652,1236002,677784,241985,1024559,789686,622599,262521,1012919,629483,343393,341324,245278,172162,1078578,844231,1048042,617089,612085,352426,473708,610075,341241,486870,634871,642941,623034,1235708,320868,249818,310556,534966,910430,638285,78209,1000477,640949,455133,5835,707674,691302,1048398,364025,642024,333741,344245,13590,516259,617751,629602,343301,711116,1050925,1375849,371365,661369,355090,123239,620895,754348,646776,444699,218590,57751,455638,599746,646702,230542,982394,1146558,1193925,644991,1413133,635463,244993,632680,1003186,174067,273485,490408,646608,633463,263080,748572,299181,6363,278791,317418,749070,662476,617622,635498,648230,286048,37768,685408,645641,1082240,1041937,1410043,1384194,634788,646903,65566,174347,86245,629368,353006,646947,368176,603702,641913,1375988,617322,727509,476832,455924,622214,375343,630670,251847,389055,244880,186938,864048,989649,300380,996754,610169,1051990,159037,1393915,251540,252322,710611,1055042,157563,631423,569119,466488,711649,276374,321213,635855,1371591,989824,995068,243668,990320,617206,483057,633761,1050081,286699,627654,633694,71032,937805,475769,1379714,622850,633698,1384616,334355,1085776,1378865,452339,1002014,90197,262160,1057040,644812,1055229,1203808,347448,645803,34770,633762,638113,131220,293858,635088,634847,988238,623812,645607,624214,40117,273380,627060,320466,710589,609824,1386460,40293,303752,666852,367032,643563,510881,327529,131646,612952,633191,639445,618618,361640,1078085,626019,1384231,259955,754508,1042884,1008638,455648,992711,348715,273756,101172,248627,1080031,617776,128846,222286,252027,633721,513017,1146956,382231,716620,429374,1200263,617861,749075,213086,608688,368198,79502,736609,617532,431422,6864,658880,1229538,260355,299748,113585,627236,263025,338382,224567,130992,609648,179049,26218,1084509,1146642,988245,1201067,637555,466399,990377,750857,1058071,710226,1393090,1409248,647853,615029,993955,646835,181988,466355,405072,351749,635480,645369,365452,1368723,624137,609237,641767,641693,712711,23678,249998,343493,1384532,715796,164703,1047653,993380,292247,129153,625298,280941,107795,677338,1068964,1388790,623090,511174,641732,1050832,169657,455923,642222,633961,262105,1134395,582303,66952,609644,636462,833684,262767,320608,939675,267876,677385,106626,1055024,6732,751518,837575,619819,642180,1077264,611300,1051586,640865,609498,320908,685414,637553,476735,288935,645588,635976,335748,384325,645146,335166,221868,629087,367018,1371659,473135,1050924,639601,246010,1051060,642246,1370183,405406,638861,754077,317765,1387457,992598,991708,204685,327175,1384103,437847,467831,599121,1409176,293005,267627,844232,201698,1064867,754063,1011167,615358,481943,42975,1027511,641405,668526,643220,1194007,262884,811850,629428,1221995,602747,643593,1392863,999769,1078062,317144,993734,482478,307273,1050736,292106,575190,296597,370934,1078908,252651,711969,303981,305214,649064,316750,712817,265779,42538,622984,750093,70701,634868,624073,1228794,1195472,605711,191111,1045601,360370,710093,671118,731368,641813,1384528,345519,648288,66896,40553,388989,601474,630687,677707,642457,852166,633362,1235060,612948,677838,1146625,1203163,625704,1394947,277457,126265,988570,759760,405042,614996,624070,279137,41085,35641,1203107,685255,355304,428353,1027174,1151831,1077289,711196,639402,467423,453420,621194,1000216,347297,1152343,1059538,327062,199820,26202,930772,647801,644504,318170,352313,93964,991953,802313,485757,1388375,486807,841774,627157,674499,657245,35993,1000466,168893,1004985,637654,629357,642423,676929,345569,611990,633809,890110,618208,457145,213992,209604,1388793,81608,13660,654291,1202719,1387700,622898,315277,273071,93988,981761,1065913,444666,1002651,1211156,328265,325284,1384341,1051441,1146279,993614,643571,193874,301886,1050843,678092,333272,93976,612659,1054585,40429,208430,631156,335752,610160,731345,756344,1146906,631625,685419,71860,672849,992597,368590,613373,679755,1231081,202128,989100,686515,833590,341811,257590,229768,1235707,712473,315518,496174,617079,1078562,13558,625162,444682,204891,1002620,266592,645872,1002705,174932,19802,299331,710895,483161,334987,341020,754080,334249,685656,634379,634228,70620,1409476,613997,433511,347459,611584,1011302,201741,648086,227119,1002144,642249,622979,344716,930898,987758,229354,121799,754700,1050250,1000476,1384909,614955,471181,878620,404185,328860,936161,266825,638815,641711,620942,320300,644642,635111,712670,1012706,607762,350697,751404,1078262,344720,618837,1049453,546855,615072,673144,642291,187645,641984,1235596,739633,343971,640994,394855,583994,352791,40134,1024607,624185,466309,361254,697630,1190433,640953,110771,634842,741682,1407444,317117,341867,195482,342106,748902,347194,779362,262961,511001,182355,990052,1406285,746987,444514,259708,928278,1068775,644239,612320,627269,735209,709330,1000471,326023,259340,992913,747919,1048122,1235610,617757,635040,245819,1049404,659896,201509,988346,235715,989468,686293,712439,850719,612625,29445,1079065,617525,642347,374187,226522,609747,626026,243514,335740,1413209,916323,749603,1052020,1075057,13013,486730,640240,618965,273467,467992,1203883,1027274,646403,621247,460567,156044,635647,992593,456919,627657,251491,1179404,602936,298002,223742,474339,623403,623253,266667,1057118,1235945,252602,1033821,635620,676642,354435,482969,938791,332435,260055,266486,1055043,405419,266200,896391,79489,316570,1000478,220350,540871,648826,366824,471160,486292,357722,638391,640121,607451,643386,203824,849440,341333,675956,638026,19272,1205245,1409399,456922,508461,362581,1038893,685993,165369,1090783,51765,66907,186706,663698,44803,1392615,637664,371658,856372,25567,330043,65579,81975,617072,636935,34410,41801,247596,1044016,219505,78058,374604,601861,490068,839869,267107,371741,642417,71048,1046076,299683,1006862,642578,627373,645378,1200619,6349,336164,455139,121716,343241,1376779,1071056,300069,258739,85531,997645,88148,858184,208772,1218831,640957,307489,997027,1370969,230466,646789,635022,252841,308102,66946,301469,1406329,180905,1392629,1000475,338808,18882,854913,983791,992601,65612,727151,215321,361588,615570,646806,617319,325134,1237217,263826,679206,609833,170262,613739,762540,316424,607707,1377296,633365,203374,332267,676661,1385968,65626,334390,195264,805793,746992,174454,1052731,503853,193821,677660,1059664,609685,89254,38603,656101,863154,607510,455741,1042812,245245,622571,1235532,188559,299253,606928,633802,295064,508000,839976,641956,218718,330099,812138,711212,626305,1055146,338845,71180,223789,466154,466703,711112,368152,642190,318018,361397,51834,1052016,335968,112042,13831,627608,334429,1057301,616231,709974,998637,616155,646796,297812,639504,1200957,205091,1407209,913419,352789,1031485,65436,645145,938744,301626,411165,411358,937050,223303,225682,1146667,709738,603200,1107347,630305,846143,680126,1078103,319358]}, 0, 10, (err, results) => {
      console.log(results.map(x => x.value))
    })

           return

  console.time("get all posts from user")

  db.query({
    type: 'AND',
    data: [
      { type: 'EQUAL', data: { seek: db.seekType, value: 'vote', indexType: "type" } },
      { type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } }
    ]
  }, (err, results) => {
    results.forEach(x => {
      if (x.value.content.expression != 'like')
        console.log(x.value.content)
    })
  })

  return

  db.query({
    type: 'AND',
    data: [
      { type: 'EQUAL', data: { seek: db.seekType, value: 'post', indexType: "type" } },
      { type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } }
    ]
  }, (err, results) => {
    console.timeEnd("get all posts from user")

    console.time("get last 10 posts from user")

    db.query({
      type: 'AND',
      data: [
        { type: 'EQUAL', data: { seek: db.seekType, value: 'post', indexType: "type" } },
        { type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } }
      ]
    }, 0, 10, (err, results) => {
      console.timeEnd("get last 10 posts from user")

      console.time("get top 50 posts")

      db.query({
        type: 'EQUAL',
        data: {
          seek: db.seekType,
          value: 'post',
          indexType: "type"
        }
      }, 0, 50, (err, results) => {
        console.timeEnd("get top 50 posts")

        console.time("author + sequence")

        db.query({
          type: 'AND',
          data: [
            { type: 'GT', data: { indexName: 'sequence', value: 7000 } },
            { type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } }
          ]
        }, (err, results) => {
          console.timeEnd("author + sequence")

          var hops = {}
          const query = {
            type: 'AND',
            data: [
              { type: 'EQUAL', data: { seek: db.seekAuthor, value: author, indexType: "author" } },
              { type: 'EQUAL', data: { seek: db.seekType, value: 'contact', indexType: "type" } }
            ]
          }
          const isFeed = require('ssb-ref').isFeed

          console.time("contacts for author")

          db.query(query, (err, results) => {
            results.forEach(data => {
              var from = data.value.author
              var to = data.value.content.contact
              var value =
                  data.value.content.blocking || data.value.content.flagged ? -1 :
                  data.value.content.following === true ? 1
                  : -2

              if(isFeed(from) && isFeed(to)) {
                hops[from] = hops[from] || {}
                hops[from][to] = value
              }
            })

            console.timeEnd("contacts for author")
            //console.log(hops)
          })
        })
      })
    })
  })

  return

  console.time("get all")
  db.query({
    type: 'EQUAL',
    data: { seek: db.seekAuthor, value: author, indexType: "author" }
  }, (err, results) => {
    console.timeEnd("get all")
  })

  /*
    db.query({
    type: 'AND',
    data: [
    { type: 'EQUAL', data: { seek: seekType, value: 'post', indexName: "type_post" } },
    { type: 'EQUAL', data: { seek: seekAuthor, value: author, indexName: "author_arj" } }
    ]
    }, true, (err, results) => {
    results.forEach(x => {
    console.log(util.inspect(x, false, null, true))
    })
    })
  */

  /*
    db.query({
    type: 'AND',
    data: [
    { type: 'EQUAL', data: { seek: seekAuthor, value: author, indexName: "author_arj" } },
    {
    type: 'OR',
    data: [
    { type: 'EQUAL', data: { seek: seekType, value: 'post', indexName: "type_post" } },
    { type: 'EQUAL', data: { seek: seekType, value: 'contact', indexName: "type_contact" } },
    ]
    }
    ]
    }, true, (err, results) => {
    results.forEach(x => {
    console.log(util.inspect(x, false, null, true))
    })
    })
  */
})
