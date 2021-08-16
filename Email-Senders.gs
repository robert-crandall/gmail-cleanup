function sender_list() {
  var inbox_threads=GmailApp.search('category:updates label:inbox ');
  var sender_array=[];
  var uA=[];
  var cObj={};
  for(var i=0;i<inbox_threads.length;i++) {
    var message=inbox_threads[i].getMessages();
    for(var x=0;x<message.length; x++) {
      var sender=message[x].getFrom();  
      if(uA.indexOf(sender)==-1) {
        uA.push(sender);
        sender_array.push([sender]);
        cObj[sender]=1;
      }else{
        cObj[sender]+=1;
      }
    }
  }
  sender_array.forEach(function(r){
    r.splice(1,0,cObj[r[0]]);
  });
  var ss=SpreadsheetApp.getActive();
  var sh=ss.getActiveSheet()
  sh.clear();
  sh.appendRow(['Email Address','Count']);
  sh.getRange(2, 1,sender_array.length,2).setValues(sender_array).sort({column:1,ascending:true});

}
