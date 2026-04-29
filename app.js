/* ── CONFIG ──────────────────────────────────────────────────── */
var ACCOUNTS = {
  Juanito:  { password:"12345", role:"user",        avatar:"JU", color:"#E81D2C", bg:"#FDF2F3", border:"#F5C0C4", text:"#3E171B" },
  Pedrito:  { password:"12345", role:"user",        avatar:"PE", color:"#3E171B", bg:"#F4F0F1", border:"#C8B8BA", text:"#3E171B" },
  Panchito: { password:"12345", role:"user",        avatar:"PA", color:"#A1CE5E", bg:"#F5FAF0", border:"#C8E4A0", text:"#3A5010" },
  Mariana:  { password:"12345", role:"coordinator", avatar:"MA", color:"#666666", bg:"#F5F5F5", border:"#CCCCCC", text:"#333333" }
};
var ORDER_USERS = ["Juanito","Pedrito","Panchito"];
var RESTAURANTS = ["San Martin","The Kitchen","Pollo Campero","McDonald's","Celeste Imperio"];
var REST_COLOR  = { "San Martin":"#E81D2C","The Kitchen":"#3E171B","Pollo Campero":"#A1CE5E","McDonald's":"#666666","Celeste Imperio":"#3E171B" };
var CHART_PAL   = ["#E81D2C","#3E171B","#A1CE5E","#666666","#C0392B","#2C3E50"];
var SK          = "pedidos_corp_v1";

/* ── TOKENS ──────────────────────────────────────────────────── */
var C = { red:"#E81D2C", dark:"#3E171B", green:"#A1CE5E", gray:"#666666", border:"#E0E0E0", bg:"#F7F7F7", white:"#FFFFFF", text:"#2A2A2A", muted:"#888888", light:"#F0F0F0" };

/* ── UTILS ───────────────────────────────────────────────────── */
function dayName(ds) {
  if (!ds) return "";
  return ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][new Date(ds+"T12:00:00").getDay()];
}
function getWeek() {
  var t=new Date(), dow=t.getDay(), diff=dow===0?-6:1-dow;
  var mon=new Date(t); mon.setDate(t.getDate()+diff);
  return ["Lunes","Martes","Miércoles","Jueves","Viernes"].map(function(name,i){
    var d=new Date(mon); d.setDate(mon.getDate()+i);
    return { name:name, date:d.toISOString().split("T")[0], disp:d.toLocaleDateString("es-GT",{day:"2-digit",month:"short"}) };
  });
}
var WEEK  = getWeek();
var TODAY = new Date().toISOString().split("T")[0];

function loadOrders()  { try { return JSON.parse(localStorage.getItem(SK)||"[]"); } catch(e) { return []; } }
function saveOrders(o) { try { localStorage.setItem(SK,JSON.stringify(o)); } catch(e) {} }

var e = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;

function cls() { return Array.from(arguments).filter(Boolean).join(" "); }

/* ── AVATAR ──────────────────────────────────────────────────── */
function Avatar(props) {
  var a=ACCOUNTS[props.name], sz=props.size||36;
  return e("div",{style:{width:sz,height:sz,borderRadius:4,background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.32,fontWeight:800,color:"#fff",flexShrink:0}},a.avatar);
}

/* ── REST PICKER ─────────────────────────────────────────────── */
function RestPicker(props) {
  var small=props.small;
  return e("div",{style:{display:"flex",flexWrap:"wrap",gap:small?4:6,marginBottom:small?8:14}},
    RESTAURANTS.map(function(r){
      var act=props.value===r;
      return e("button",{key:r,onClick:function(){props.onChange(r);},style:{padding:small?"3px 10px":"6px 14px",borderRadius:3,border:"1.5px solid "+(act?C.red:C.border),background:act?C.red:C.white,color:act?"#fff":C.gray,cursor:"pointer",fontSize:small?11:12,fontWeight:act?700:500,fontFamily:"Montserrat,sans-serif",transition:"all .15s"}},r);
    })
  );
}

/* ── SECTION TITLE ───────────────────────────────────────────── */
function SectionTitle(props) {
  return e("div",{style:{marginBottom:20}},
    e("h2",{style:{fontSize:14,fontWeight:800,color:C.dark,letterSpacing:.5,textTransform:"uppercase",margin:0,display:"flex",alignItems:"center",gap:10}},
      e("span",{style:{width:3,height:16,background:C.red,borderRadius:2,display:"inline-block",flexShrink:0}}),
      props.title
    ),
    props.sub ? e("p",{style:{fontSize:11,color:C.muted,margin:"5px 0 0 13px",fontWeight:500}},props.sub) : null
  );
}

/* ── METRICS VIEW ────────────────────────────────────────────── */
function MetricsView(props) {
  var orders=props.orders;
  var thisWeek=orders.filter(function(o){return WEEK.some(function(d){return d.date===o.date;});});
  var totalUnits=orders.reduce(function(s,o){return s+ +o.qty;},0);
  var avgQty=orders.length?(totalUnits/orders.length).toFixed(1):"–";
  var restAgg={}; orders.forEach(function(o){restAgg[o.restaurant]=(restAgg[o.restaurant]||0)+ +o.qty;});
  var topRest=Object.entries(restAgg).sort(function(a,b){return b[1]-a[1];})[0]?.[0]||"–";
  var userAgg={}; ORDER_USERS.forEach(function(u){userAgg[u]=orders.filter(function(o){return o.user===u;}).reduce(function(s,o){return s+ +o.qty;},0);});
  var topUser=Object.entries(userAgg).sort(function(a,b){return b[1]-a[1];})[0]?.[0]||"–";

  var userChartData=ORDER_USERS.map(function(u){return{nombre:u,pedidos:orders.filter(function(o){return o.user===u;}).length,unidades:orders.filter(function(o){return o.user===u;}).reduce(function(s,o){return s+ +o.qty;},0)};});
  var restChartData=RESTAURANTS.map(function(r){return{nombre:r.length>11?r.slice(0,11)+"…":r,unidades:orders.filter(function(o){return o.restaurant===r;}).reduce(function(s,o){return s+ +o.qty;},0)};}).filter(function(r){return r.unidades>0;});
  var dayChartData=["Lunes","Martes","Miércoles","Jueves","Viernes"].map(function(d){return{dia:d.slice(0,3),pedidos:orders.filter(function(o){return o.dayName===d;}).length};});
  var pieData=ORDER_USERS.map(function(u){return{name:u,value:orders.filter(function(o){return o.user===u;}).length};}).filter(function(d){return d.value>0;});

  var kpis=[{lbl:"Total Pedidos",val:orders.length,col:C.red,sub:"registros"},{lbl:"Esta Semana",val:thisWeek.length,col:C.dark,sub:"activos"},{lbl:"Total Unidades",val:totalUnits,col:C.green,sub:"platos"},{lbl:"Promedio/Pedido",val:avgQty,col:C.gray,sub:"unidades"}];
  var RC=Recharts;

  return e("div",null,
    e(SectionTitle,{title:"Panel de Métricas",sub:"Resumen general de pedidos y actividad"}),
    e("div",{className:"kpi-grid",style:{marginBottom:16}},
      kpis.map(function(k){return e("div",{key:k.lbl,className:"kpi-card"},
        e("div",{className:"kpi-card__accent",style:{background:k.col}}),
        e("div",{className:"kpi-card__val",style:{color:k.col}},k.val),
        e("div",{className:"kpi-card__lbl"},k.lbl),
        e("div",{className:"kpi-card__sub"},k.sub)
      );})
    ),
    e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}},
      e("div",{className:"highlight-card",style:{borderLeft:"4px solid "+C.red}},e("div",{className:"highlight-card__lbl"},"Restaurante más solicitado"),e("div",{className:"highlight-card__val"},topRest)),
      e("div",{className:"highlight-card",style:{borderLeft:"4px solid "+C.green}},e("div",{className:"highlight-card__lbl"},"Colaborador más activo"),e("div",{className:"highlight-card__val"},topUser))
    ),
    orders.length===0
      ? e("div",{className:"empty-state"},"Sin pedidos. Las métricas aparecerán cuando haya pedidos registrados.")
      : e("div",null,
          e("div",{className:"card",style:{marginBottom:14}},
            e("div",{className:"card__title"},"Pedidos por colaborador"),
            userChartData.map(function(u){
              var a=ACCOUNTS[u.nombre], pct=orders.length?Math.round((u.pedidos/orders.length)*100):0;
              return e("div",{key:u.nombre,style:{marginBottom:16}},
                e("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:6}},
                  e(Avatar,{name:u.nombre,size:26}),
                  e("span",{style:{fontSize:12,fontWeight:700,flex:1,color:C.text}},u.nombre),
                  e("span",{style:{fontSize:11,color:C.muted}},u.pedidos+" ped. · "+u.unidades+" uds."),
                  e("span",{style:{fontSize:12,fontWeight:700,color:a.color,minWidth:36,textAlign:"right"}},pct+"%")
                ),
                e("div",{style:{background:C.light,borderRadius:2,height:6,overflow:"hidden"}},
                  e("div",{style:{height:"100%",borderRadius:2,background:a.color,width:pct+"%",transition:"width .5s ease"}})
                )
              );
            })
          ),
          e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}},
            e("div",{className:"card"},
              e("div",{className:"card__title"},"Unidades por restaurante"),
              e(RC.ResponsiveContainer,{width:"100%",height:160},
                e(RC.BarChart,{data:restChartData,margin:{top:4,right:0,left:-24,bottom:0}},
                  e(RC.CartesianGrid,{strokeDasharray:"2 4",stroke:"#EBEBEB",vertical:false}),
                  e(RC.XAxis,{dataKey:"nombre",tick:{fontSize:8,fill:C.muted}}),
                  e(RC.YAxis,{tick:{fontSize:9,fill:C.muted}}),
                  e(RC.Tooltip,{contentStyle:{fontSize:11,borderRadius:3,border:"1px solid "+C.border}}),
                  e(RC.Bar,{dataKey:"unidades",radius:[2,2,0,0]},
                    restChartData.map(function(_,i){return e(RC.Cell,{key:i,fill:CHART_PAL[i%CHART_PAL.length]});})
                  )
                )
              )
            ),
            e("div",{className:"card"},
              e("div",{className:"card__title"},"Pedidos por día"),
              e(RC.ResponsiveContainer,{width:"100%",height:160},
                e(RC.BarChart,{data:dayChartData,margin:{top:4,right:0,left:-24,bottom:0}},
                  e(RC.CartesianGrid,{strokeDasharray:"2 4",stroke:"#EBEBEB",vertical:false}),
                  e(RC.XAxis,{dataKey:"dia",tick:{fontSize:10,fill:C.muted}}),
                  e(RC.YAxis,{tick:{fontSize:9,fill:C.muted},allowDecimals:false}),
                  e(RC.Tooltip,{contentStyle:{fontSize:11,borderRadius:3,border:"1px solid "+C.border}}),
                  e(RC.Bar,{dataKey:"pedidos",fill:C.red,radius:[2,2,0,0]})
                )
              )
            )
          ),
          e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}},
            pieData.length>1 ? e("div",{className:"card"},
              e("div",{className:"card__title"},"Distribución de pedidos"),
              e(RC.ResponsiveContainer,{width:"100%",height:150},
                e(RC.PieChart,null,
                  e(RC.Pie,{data:pieData,cx:"50%",cy:"50%",outerRadius:55,dataKey:"value",label:function(p){return p.name+" "+Math.round(p.percent*100)+"%";},labelLine:false,style:{fontSize:9}},
                    pieData.map(function(_,i){return e(RC.Cell,{key:i,fill:CHART_PAL[i%CHART_PAL.length]});})
                  ),
                  e(RC.Tooltip,{contentStyle:{fontSize:11}})
                )
              )
            ) : null,
            e("div",{className:"card"},
              e("div",{className:"card__title"},"Semana actual"),
              e("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginTop:8}},
                WEEK.map(function(d){
                  var n=orders.filter(function(o){return o.date===d.date;}).length, isT=d.date===TODAY;
                  return e("div",{key:d.date,className:cls("week-cell",isT&&"week-cell--today")},
                    e("div",{className:"week-cell__day"},d.name.slice(0,3)),
                    e("div",{className:"week-cell__num",style:{color:n>0?C.red:C.border}},n),
                    e("div",{className:"week-cell__date"},d.disp)
                  );
                })
              )
            )
          )
        )
  );
}

/* ── EVERYONE VIEW ───────────────────────────────────────────── */
function EveryoneView(props) {
  var orders=props.orders, onDelete=props.onDelete;
  return e("div",null,
    e(SectionTitle,{title:"Por Colaborador",sub:"Pedidos individuales de cada miembro del equipo"}),
    ORDER_USERS.map(function(u){
      var a=ACCOUNTS[u];
      var uOrders=orders.filter(function(o){return o.user===u;}).sort(function(a,b){return a.date.localeCompare(b.date);});
      return e("div",{key:u,className:"card",style:{marginBottom:12}},
        e("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:12,borderBottom:"1px solid "+C.border}},
          e(Avatar,{name:u,size:40}),
          e("div",{style:{flex:1}},
            e("div",{style:{fontSize:14,fontWeight:700,color:C.dark}},u),
            e("div",{style:{fontSize:11,color:C.muted,marginTop:2}},uOrders.length+" pedido(s) · "+uOrders.reduce(function(s,o){return s+ +o.qty;},0)+" unidades")
          ),
          e("div",{className:"chip",style:{background:a.bg,color:a.text,border:"1px solid "+a.border}},new Set(uOrders.map(function(o){return o.restaurant;})).size+" restaurantes")
        ),
        uOrders.length===0
          ? e("p",{style:{margin:0,color:C.muted,fontSize:12}},"Sin pedidos registrados.")
          : e("table",{className:"data-table"},
              e("thead",null,e("tr",null,["Restaurante","Plato","Cant.","Fecha","Obs.",""].map(function(h){return e("th",{key:h},h);}))),
              e("tbody",null,uOrders.map(function(o){
                return e("tr",{key:o.id},
                  e("td",null,e("span",{style:{display:"flex",alignItems:"center",gap:6}},e("span",{style:{width:7,height:7,borderRadius:"50%",background:REST_COLOR[o.restaurant],display:"inline-block",flexShrink:0}}),e("span",{style:{fontSize:11,fontWeight:700,color:REST_COLOR[o.restaurant]}},o.restaurant))),
                  e("td",null,o.item),
                  e("td",{style:{textAlign:"center",fontWeight:700}},o.qty),
                  e("td",{style:{color:C.muted,fontSize:11,whiteSpace:"nowrap"}},o.dayName+" "+o.date.slice(5)),
                  e("td",{style:{color:C.muted,fontSize:11,fontStyle:"italic",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},o.note||"—"),
                  e("td",null,e("button",{onClick:function(){onDelete(o.id);},className:"btn-icon-del"},"×"))
                );
              }))
            )
      );
    })
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
function App() {
  var authState      = useState(null);                var auth=authState[0], setAuth=authState[1];
  var lnState        = useState("Juanito");           var loginName=lnState[0], setLoginName=lnState[1];
  var lpState        = useState("");                  var loginPwd=lpState[0], setLoginPwd=lpState[1];
  var leState        = useState("");                  var loginErr=leState[0], setLoginErr=leState[1];
  var pvState        = useState(false);               var pwdVis=pvState[0], setPwdVis=pvState[1];
  var tabState       = useState("order");             var tab=tabState[0], setTab=tabState[1];
  var ordState       = useState(loadOrders);          var orders=ordState[0], setOrders=ordState[1];
  var toastState     = useState("");                  var toast=toastState[0], setToast=toastState[1];
  var formState      = useState({restaurant:"",item:"",qty:1,note:"",date:TODAY}); var form=formState[0], setForm=formState[1];

  function mkSched() { var r={}; WEEK.forEach(function(d){r[d.date]={on:false,restaurant:"",item:"",qty:1,note:""};return r;}); return r; }
  var schedState = useState(mkSched); var sched=schedState[0], setSched=schedState[1];

  useEffect(function(){ saveOrders(orders); },[orders]);
  useEffect(function(){
    if(!auth) return;
    var ns=mkSched();
    orders.filter(function(o){return o.user===auth.name&&WEEK.some(function(d){return d.date===o.date;});}).forEach(function(o){ns[o.date]={on:true,restaurant:o.restaurant,item:o.item,qty:o.qty,note:o.note||""};});
    setSched(ns);
  },[auth&&auth.name]);

  function notify(msg){ setToast(msg); setTimeout(function(){setToast("");},2800); }
  function login(){
    var acc=ACCOUNTS[loginName];
    if(!acc||loginPwd!==acc.password){ setLoginErr("Contraseña incorrecta. Intenta de nuevo."); return; }
    setLoginErr(""); setLoginPwd(""); setAuth({name:loginName,role:acc.role});
    setTab(acc.role==="coordinator"?"metrics":"order");
  }
  function logout(){ setAuth(null); setLoginPwd(""); setLoginErr(""); }
  function addOrder(){
    if(!form.restaurant) return notify("Selecciona un restaurante");
    if(!form.item.trim()) return notify("Escribe lo que quieres pedir");
    setOrders(function(p){return[...p,{id:Date.now()+"-"+Math.random(),user:auth.name,restaurant:form.restaurant,item:form.item,qty:+form.qty,note:form.note,date:form.date,dayName:dayName(form.date),ts:Date.now()}];});
    setForm({restaurant:"",item:"",qty:1,note:"",date:TODAY});
    notify("Pedido guardado correctamente");
  }
  function saveSchedule(){
    var active=WEEK.filter(function(d){return sched[d.date]&&sched[d.date].on&&sched[d.date].restaurant&&sched[d.date].item&&sched[d.date].item.trim();});
    if(!active.length) return notify("Activa al menos un día con datos completos");
    var wDates=WEEK.map(function(d){return d.date;});
    setOrders(function(p){
      return p.filter(function(o){return!(o.user===auth.name&&wDates.includes(o.date));}).concat(
        active.map(function(d){return{id:"sch-"+Date.now()+"-"+d.date,user:auth.name,date:d.date,restaurant:sched[d.date].restaurant,item:sched[d.date].item,qty:+sched[d.date].qty||1,note:sched[d.date].note||"",dayName:d.name,ts:Date.now()};})
      );
    });
    notify(active.length+" día(s) programado(s) correctamente");
  }
  function deleteOrder(id){ setOrders(function(p){return p.filter(function(o){return o.id!==id;});}); }
  function exportExcel(){
    if(!orders.length) return notify("No hay pedidos para exportar");
    var wb=XLSX.utils.book_new();
    var sort=[...orders].sort(function(a,b){return a.date.localeCompare(b.date);});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sort.map(function(o){return{Solicitante:o.user,Restaurante:o.restaurant,"Menú":o.item,Cantidad:o.qty,Observación:o.note||"-",Fecha:o.date,Día:o.dayName};})),"Todos los Pedidos");
    var agg={}; orders.forEach(function(o){var k=o.restaurant+"|"+o.item;if(!agg[k])agg[k]={Restaurante:o.restaurant,Plato:o.item,"Total Unidades":0,Detalle:[]};agg[k]["Total Unidades"]+= +o.qty;agg[k].Detalle.push(o.user+"("+o.qty+")");});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(Object.values(agg).map(function(r){return Object.assign({},r,{Detalle:r.Detalle.join(", ")});})),"Consolidado");
    ORDER_USERS.forEach(function(u){var rows=orders.filter(function(o){return o.user===u;}).sort(function(a,b){return a.date.localeCompare(b.date);});if(rows.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.map(function(o){return{Restaurante:o.restaurant,"Menú":o.item,Cantidad:o.qty,Observación:o.note||"-",Fecha:o.date,Día:o.dayName};})),u);});
    XLSX.writeFile(wb,"pedidos_"+TODAY+".xlsx");
    notify("Excel descargado exitosamente");
  }

  /* LOGIN SCREEN */
  if(!auth) return e("div",{className:"login-screen"},
    e("div",{className:"login-panel"},
      e("div",{className:"login-brand"},
        e("div",{className:"login-logo"},
          e("svg",{width:22,height:22,viewBox:"0 0 22 22",fill:"none"},
            e("rect",{width:22,height:22,rx:4,fill:"#E81D2C"}),
            e("path",{d:"M11 3C8.5 3 6.5 5.2 6.5 8c0 2.2 1.2 4 2.7 5.6L11 16.5l1.8-2.9c1.5-1.6 2.7-3.4 2.7-5.6C15.5 5.2 13.5 3 11 3z",fill:"rgba(255,255,255,.95)"}),
            e("circle",{cx:11,cy:8,r:2,fill:"#E81D2C"})
          )
        ),
        e("div",null,e("h1",{className:"login-title"},"Pedidos del Día"),e("p",{className:"login-sub"},"Sistema de consolidación de pedidos"))
      ),
      e("div",{className:"login-divider"}),
      e("div",{className:"week-badge"},"Semana: "+WEEK[0].disp+" — "+WEEK[4].disp),
      e("div",{style:{marginBottom:20}},
        e("label",{className:"field-label"},"Selecciona tu usuario"),
        Object.entries(ACCOUNTS).map(function(entry){
          var name=entry[0], acc=entry[1], active=loginName===name;
          return e("button",{key:name,onClick:function(){setLoginName(name);setLoginErr("");},className:cls("user-row",active&&"user-row--active"),style:{borderColor:active?acc.color:C.border}},
            e("div",{className:"user-row__av",style:{background:acc.color}},acc.avatar),
            e("div",{style:{flex:1,textAlign:"left"}},
              e("div",{style:{fontSize:13,fontWeight:700,color:active?acc.color:C.text}},name),
              e("div",{style:{fontSize:10,color:C.muted,marginTop:1}},acc.role==="coordinator"?"Coordinadora · Acceso completo":"Colaborador · Pedidos y agenda")
            ),
            active ? e("div",{className:"user-row__check",style:{background:acc.color}},
              e("svg",{width:9,height:7,viewBox:"0 0 9 7",fill:"none"},e("path",{d:"M1 3.5l2.5 2.5 4.5-5",stroke:"#fff",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"}))
            ) : null
          );
        })
      ),
      e("div",{style:{marginBottom:20}},
        e("label",{className:"field-label"},"Contraseña"),
        e("div",{style:{position:"relative"}},
          e("input",{type:pwdVis?"text":"password",value:loginPwd,onChange:function(ev){setLoginPwd(ev.target.value);setLoginErr("");},onKeyDown:function(ev){if(ev.key==="Enter")login();},placeholder:"Ingresa tu contraseña",className:"field-input",style:{paddingRight:40,borderColor:loginErr?"#E81D2C":C.border}}),
          e("button",{onClick:function(){setPwdVis(function(v){return!v;});},className:"pwd-eye"},pwdVis?"◎":"●")
        ),
        loginErr ? e("p",{className:"field-error"},loginErr) : null
      ),
      e("button",{onClick:login,className:"btn-primary btn-full"},"Ingresar"),
      e("p",{className:"login-footer"},"Sistema interno · Uso exclusivo del equipo")
    )
  );

  /* APP */
  var myOrders  = orders.filter(function(o){return o.user===auth.name;}).sort(function(a,b){return a.date.localeCompare(b.date);});
  var allSorted = [...orders].sort(function(a,b){return a.date.localeCompare(b.date);});
  var byDate    = allSorted.reduce(function(acc,o){(acc[o.date]=acc[o.date]||[]).push(o);return acc;},{});
  var restSumm  = orders.reduce(function(acc,o){if(!acc[o.restaurant])acc[o.restaurant]={total:0,items:{}};acc[o.restaurant].total+= +o.qty;acc[o.restaurant].items[o.item]=(acc[o.restaurant].items[o.item]||0)+ +o.qty;return acc;},{});
  var USER_TABS  = [{id:"order",label:"Nuevo Pedido"},{id:"schedule",label:"Mi Semana"},{id:"mine",label:"Mis Pedidos",badge:myOrders.length}];
  var COORD_TABS = [{id:"metrics",label:"Métricas"},{id:"all",label:"Consolidado",badge:orders.length},{id:"everyone",label:"Por Colaborador"}];
  var TABS = auth.role==="coordinator"?USER_TABS.concat(COORD_TABS):USER_TABS;
  var acct = ACCOUNTS[auth.name];

  return e("div",{className:"app-shell"},
    /* HEADER */
    e("header",{className:"app-header"},
      e("div",{style:{display:"flex",alignItems:"center",gap:12}},
        e("div",{style:{width:32,height:32,borderRadius:4,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}},
          e("svg",{width:18,height:18,viewBox:"0 0 18 18",fill:"none"},
            e("path",{d:"M9 2C6.8 2 5 4 5 6.5c0 2 1 3.8 2.2 5.2L9 14l1.8-2.3C12 10.3 13 8.5 13 6.5 13 4 11.2 2 9 2z",fill:"rgba(255,255,255,.9)"}),
            e("circle",{cx:9,cy:"6.5",r:"1.8",fill:"#E81D2C"})
          )
        ),
        e("div",null,e("span",{className:"header-appname"},"Pedidos del Día"),e("span",{className:"header-week"}," · Semana "+WEEK[0].disp+" – "+WEEK[4].disp))
      ),
      e("div",{style:{display:"flex",alignItems:"center",gap:12}},
        e("div",{style:{display:"flex",alignItems:"center",gap:8}},
          e("div",{className:"header-av",style:{background:acct.color}},acct.avatar),
          e("div",null,
            e("div",{style:{fontSize:12,fontWeight:700,color:C.dark}},auth.name),
            auth.role==="coordinator"?e("div",{style:{fontSize:9,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:.8}},"Coordinadora"):null
          )
        ),
        e("button",{onClick:logout,className:"btn-ghost-sm"},"Salir")
      )
    ),
    /* TOAST */
    toast ? e("div",{style:{background:C.dark,color:"#fff",padding:"10px 24px",textAlign:"center",fontSize:12,fontWeight:600,fontFamily:"Montserrat,sans-serif"}},toast) : null,
    /* LAYOUT */
    e("div",{className:"app-layout"},
      /* SIDEBAR */
      e("nav",{className:"sidebar"},
        e("div",{className:"sidebar__section-lbl"},"NAVEGACIÓN"),
        TABS.map(function(t){
          return e("button",{key:t.id,onClick:function(){setTab(t.id);},className:cls("sidebar__item",tab===t.id&&"sidebar__item--active")},
            e("span",null,t.label),
            t.badge>0?e("span",{className:cls("sidebar__badge",tab===t.id&&"sidebar__badge--active")},t.badge):null
          );
        }),
        e("div",{className:"sidebar__divider"}),
        e("div",{style:{padding:"0 14px"}},
          e("div",{style:{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:6,fontWeight:700}},"Total global"),
          e("div",{style:{fontSize:26,fontWeight:900,color:C.dark,lineHeight:1}},orders.length),
          e("div",{style:{fontSize:10,color:C.muted,marginTop:2}},"pedidos registrados")
        )
      ),
      /* CONTENT */
      e("main",{className:"main-content"},
        /* NUEVO PEDIDO */
        tab==="order" ? e("div",null,
          e(SectionTitle,{title:"Nuevo Pedido",sub:"Registra tu pedido para el día seleccionado"}),
          e("div",{className:"card"},
            e("div",{className:"form-group",style:{marginBottom:14}},
              e("label",{className:"field-label"},"Restaurante"),
              e(RestPicker,{value:form.restaurant,onChange:function(r){setForm(function(f){return Object.assign({},f,{restaurant:r});});}})
            ),
            e("div",{className:"form-grid-2"},
              e("div",{className:"form-group"},e("label",{className:"field-label"},"Menú / Plato"),e("input",{className:"field-input",placeholder:"Ej: Combo pollo con papas…",value:form.item,onChange:function(ev){setForm(function(f){return Object.assign({},f,{item:ev.target.value});});}})),
              e("div",{className:"form-group"},e("label",{className:"field-label"},"Cantidad"),e("input",{type:"number",min:1,max:20,className:"field-input",value:form.qty,onChange:function(ev){setForm(function(f){return Object.assign({},f,{qty:ev.target.value});});}})),
              e("div",{className:"form-group"},e("label",{className:"field-label"},"Observaciones especiales"),e("input",{className:"field-input",placeholder:"Sin cebolla, sin gluten, para llevar…",value:form.note,onChange:function(ev){setForm(function(f){return Object.assign({},f,{note:ev.target.value});});}})),
              e("div",{className:"form-group"},e("label",{className:"field-label"},"Fecha del pedido"),e("input",{type:"date",className:"field-input",value:form.date,onChange:function(ev){setForm(function(f){return Object.assign({},f,{date:ev.target.value});});}}))
            ),
            e("div",{style:{marginTop:20,paddingTop:16,borderTop:"1px solid "+C.border}},e("button",{onClick:addOrder,className:"btn-primary"},"Guardar Pedido"))
          )
        ) : null,

        /* MI SEMANA */
        tab==="schedule" ? e("div",null,
          e(SectionTitle,{title:"Mi Semana",sub:"Planifica tus pedidos para toda la semana de una vez"}),
          e("div",{className:"card"},
            e("p",{style:{fontSize:12,color:C.muted,marginBottom:18,lineHeight:1.7}},"Activa los días que deseas programar, completa los datos y guarda. Se reemplazará la programación anterior de los días seleccionados."),
            WEEK.map(function(d){
              var isPast=d.date<TODAY, isToday=d.date===TODAY, dd=sched[d.date]||{};
              return e("div",{key:d.date,className:cls("schedule-row",dd.on&&"schedule-row--active",isPast&&"schedule-row--past")},
                e("div",{className:"schedule-row__header"},
                  e("label",{className:"schedule-row__label"},
                    e("input",{type:"checkbox",checked:!!dd.on,disabled:isPast,onChange:function(ev){var v=ev.target.checked;setSched(function(s){var ns=Object.assign({},s);ns[d.date]=Object.assign({},ns[d.date],{on:v});return ns;});},style:{accentColor:C.red,marginRight:10}}),
                    e("span",{style:{fontWeight:700,fontSize:13}},d.name),
                    e("span",{style:{color:C.muted,fontSize:12,fontWeight:400,marginLeft:8}},d.disp),
                    isToday?e("span",{className:"badge-today"},"Hoy"):null,
                    isPast?e("span",{style:{fontSize:10,color:C.muted,marginLeft:6}},"· pasado"):null
                  )
                ),
                dd.on ? e("div",{className:"schedule-row__fields"},
                  e(RestPicker,{value:dd.restaurant,onChange:function(r){setSched(function(s){var ns=Object.assign({},s);ns[d.date]=Object.assign({},ns[d.date],{restaurant:r});return ns;});},small:true}),
                  e("div",{className:"form-grid-3"},
                    e("div",{className:"form-group",style:{gridColumn:"1 / 3"}},e("label",{className:"field-label"},"Plato"),e("input",{className:"field-input field-input--sm",placeholder:"¿Qué quieres pedir?",value:dd.item||"",onChange:function(ev){var v=ev.target.value;setSched(function(s){var ns=Object.assign({},s);ns[d.date]=Object.assign({},ns[d.date],{item:v});return ns;});}})),
                    e("div",{className:"form-group"},e("label",{className:"field-label"},"Cant."),e("input",{type:"number",min:1,className:"field-input field-input--sm",value:dd.qty||1,onChange:function(ev){var v=ev.target.value;setSched(function(s){var ns=Object.assign({},s);ns[d.date]=Object.assign({},ns[d.date],{qty:v});return ns;});}})),
                    e("div",{className:"form-group",style:{gridColumn:"1 / -1"}},e("label",{className:"field-label"},"Observaciones"),e("input",{className:"field-input field-input--sm",placeholder:"Observaciones especiales…",value:dd.note||"",onChange:function(ev){var v=ev.target.value;setSched(function(s){var ns=Object.assign({},s);ns[d.date]=Object.assign({},ns[d.date],{note:v});return ns;});}}))
                  )
                ) : null
              );
            }),
            e("div",{style:{marginTop:20,paddingTop:16,borderTop:"1px solid "+C.border}},e("button",{onClick:saveSchedule,className:"btn-success"},"Guardar Programación Semanal"))
          )
        ) : null,

        /* MIS PEDIDOS */
        tab==="mine" ? e("div",null,
          e(SectionTitle,{title:"Mis Pedidos",sub:"Historial de tus pedidos registrados"}),
          myOrders.length===0
            ? e("div",{className:"empty-state"},"No tienes pedidos registrados. Usa \"Nuevo Pedido\" o \"Mi Semana\" para agregar.")
            : e("div",null,
                e("div",{className:"kpi-grid",style:{marginBottom:16}},
                  [{lbl:"Total",val:myOrders.length,col:C.red},{lbl:"Esta semana",val:myOrders.filter(function(o){return WEEK.some(function(d){return d.date===o.date;});}).length,col:C.dark},{lbl:"Restaurantes",val:new Set(myOrders.map(function(o){return o.restaurant;})).size,col:C.green},{lbl:"Unidades",val:myOrders.reduce(function(s,o){return s+ +o.qty;},0),col:C.gray}].map(function(s){
                    return e("div",{key:s.lbl,className:"kpi-card"},e("div",{className:"kpi-card__accent",style:{background:s.col}}),e("div",{className:"kpi-card__val",style:{color:s.col}},s.val),e("div",{className:"kpi-card__lbl"},s.lbl));
                  })
                ),
                e("div",{className:"card",style:{padding:0}},
                  e("table",{className:"data-table"},
                    e("thead",null,e("tr",null,["Restaurante","Plato","Cant.","Día","Observación",""].map(function(h){return e("th",{key:h},h);}))),
                    e("tbody",null,myOrders.map(function(o){
                      return e("tr",{key:o.id},
                        e("td",null,e("span",{style:{display:"flex",alignItems:"center",gap:6}},e("span",{style:{width:7,height:7,borderRadius:"50%",background:REST_COLOR[o.restaurant],display:"inline-block",flexShrink:0}}),e("span",{style:{fontSize:11,fontWeight:700,color:REST_COLOR[o.restaurant]}},o.restaurant))),
                        e("td",{style:{fontWeight:600}},o.item),
                        e("td",{style:{textAlign:"center",fontWeight:800,color:C.red}},o.qty),
                        e("td",{style:{color:C.muted,fontSize:11,whiteSpace:"nowrap"}},o.dayName+" · "+o.date),
                        e("td",{style:{color:C.muted,fontSize:11,fontStyle:"italic"}},o.note||"—"),
                        e("td",null,e("button",{onClick:function(){deleteOrder(o.id);},className:"btn-icon-del"},"×"))
                      );
                    }))
                  )
                )
              )
        ) : null,

        /* MÉTRICAS */
        (tab==="metrics"&&auth.role==="coordinator") ? e(MetricsView,{orders:orders}) : null,

        /* CONSOLIDADO */
        (tab==="all"&&auth.role==="coordinator") ? e("div",null,
          e("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}},
            e(SectionTitle,{title:"Consolidado",sub:orders.length+" pedidos · "+ORDER_USERS.join(", ")}),
            e("button",{onClick:exportExcel,className:"btn-outline-dark"},"↓ Exportar Excel")
          ),
          e("div",{className:"kpi-grid",style:{marginBottom:16}},
            ORDER_USERS.map(function(u){
              var a=ACCOUNTS[u], n=orders.filter(function(o){return o.user===u;}).length;
              return e("div",{key:u,className:"kpi-card",style:{background:a.bg,borderColor:a.border}},
                e("div",{className:"kpi-card__accent",style:{background:a.color}}),
                e("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8}},e(Avatar,{name:u,size:22}),e("span",{style:{fontSize:12,fontWeight:700,color:a.text}},u)),
                e("div",{className:"kpi-card__val",style:{color:a.color,fontSize:24}},n),
                e("div",{className:"kpi-card__sub"},orders.filter(function(o){return o.user===u;}).reduce(function(s,o){return s+ +o.qty;},0)+" unidades")
              );
            })
          ),
          orders.length===0
            ? e("div",{className:"empty-state"},"No hay pedidos registrados aún.")
            : e("div",null,
                Object.entries(byDate).map(function(entry){
                  var date=entry[0], dayOrders=entry[1];
                  return e("div",{key:date,className:"card",style:{marginBottom:12}},
                    e("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:10,borderBottom:"1px solid "+C.border}},
                      e("div",{style:{background:C.dark,color:"#fff",borderRadius:3,padding:"3px 10px",fontSize:11,fontWeight:800,flexShrink:0}},dayName(date).slice(0,3).toUpperCase()),
                      e("span",{style:{fontSize:13,fontWeight:700,color:C.dark}},dayName(date)+" · "+date),
                      e("span",{style:{fontSize:11,color:C.muted,marginLeft:"auto"}},dayOrders.length+" pedido(s)")
                    ),
                    e("table",{className:"data-table"},
                      e("thead",null,e("tr",null,["Colaborador","Restaurante","Plato","Cant.","Obs."].map(function(h){return e("th",{key:h},h);}))),
                      e("tbody",null,dayOrders.map(function(o){
                        var ac=ACCOUNTS[o.user];
                        return e("tr",{key:o.id},
                          e("td",null,e("span",{className:"chip",style:{background:ac.bg,color:ac.text,border:"1px solid "+ac.border}},o.user)),
                          e("td",null,e("span",{style:{fontSize:11,fontWeight:700,color:REST_COLOR[o.restaurant]}},o.restaurant)),
                          e("td",{style:{fontWeight:500}},o.item),
                          e("td",{style:{textAlign:"center",fontWeight:800,color:C.red}},o.qty),
                          e("td",{style:{color:C.muted,fontSize:11,fontStyle:"italic"}},o.note||"—")
                        );
                      }))
                    )
                  );
                }),
                e("div",{className:"card"},
                  e("div",{className:"card__title"},"Resumen por Restaurante"),
                  e("table",{className:"data-table",style:{marginTop:10}},
                    e("thead",null,e("tr",null,["Restaurante","Plato","Unidades"].map(function(h){return e("th",{key:h},h);}))),
                    e("tbody",null,
                      Object.entries(restSumm).reduce(function(rows,entry){
                        var rest=entry[0], data=entry[1];
                        Object.entries(data.items).forEach(function(ie,i){
                          var item=ie[0], qty=ie[1];
                          rows.push(e("tr",{key:rest+"-"+item},
                            i===0?e("td",{rowSpan:Object.keys(data.items).length,style:{fontWeight:700,color:REST_COLOR[rest],verticalAlign:"top",paddingTop:10}},
                              e("span",{style:{display:"flex",alignItems:"center",gap:6}},e("span",{style:{width:8,height:8,borderRadius:"50%",background:REST_COLOR[rest],display:"inline-block",flexShrink:0}}),rest)
                            ):null,
                            e("td",null,item),
                            e("td",{style:{textAlign:"center",fontWeight:800,color:C.red}},qty)
                          ));
                        });
                        return rows;
                      },[])
                    ),
                    e("tfoot",null,e("tr",null,
                      e("td",{colSpan:2,style:{fontWeight:800,color:C.dark,textAlign:"right",paddingRight:16}},"TOTAL GENERAL"),
                      e("td",{style:{textAlign:"center",fontWeight:900,color:C.red,fontSize:15}},orders.reduce(function(s,o){return s+ +o.qty;},0))
                    ))
                  )
                ),
                e("div",{style:{textAlign:"right",marginTop:12}},
                  e("button",{onClick:function(){if(window.confirm("¿Eliminar todos los pedidos? Esta acción no se puede deshacer.")){setOrders([]);notify("Pedidos eliminados");}},className:"btn-danger-ghost"},"Borrar todos los pedidos")
                )
              )
        ) : null,

        /* POR COLABORADOR */
        (tab==="everyone"&&auth.role==="coordinator") ? e(EveryoneView,{orders:orders,onDelete:deleteOrder}) : null
      )
    )
  );
}

/* ── BOOT ─────────────────────────────────────────────────────── */
var rootEl = document.getElementById("root");
var root   = ReactDOM.createRoot(rootEl);
root.render(React.createElement(App));
