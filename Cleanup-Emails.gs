  
var DAYS = 3;
var categories = ["updates","promotions"]

function Install() {
  /* Run uninstall first to avoid overlap */
  Uninstall()
  
  /* Scheduled trigger to purge mail daily */
  ScriptApp.newTrigger("Run")
           .timeBased()
           .atHour(1)
           .everyDays(1)
           .create();

}

function Uninstall() {
  
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.archiveTrigger(triggers[i]);
  }
  
}

// Run function takes a Gmail search string, and passes that to Delete or Archive functions.
  function Run() {
    console.info("[" + (new Date()) + "] Running Process Emails")

    var age = new Date();
    age.setDate(age.getDate() - DAYS);
    var purgeDate = Utilities.formatDate(age, Session.getTimeZone(), "yyyy-MM-dd");

    // Loop through categories to generate a unique search string for each one
    // Important messages will only be archived, not deleted
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i]
        var delSearch = "(NOT is:important) category:" + category + " label:inbox before:" + purgeDate;
        Delete(delSearch)
        var archiveSearch = "category:" + category + " label:inbox before:" + purgeDate;
        Archive(archiveSearch)
    }    

}
    
// Delete function deletes messages found with a search string
// Will archive any messages with "Keep" in the label. Even nested labels, like Keep/Shopping, are kept.
function Delete(search) {
    console.info("Deleting messages matching this query: " + search)
    var age = new Date();
    // Generate a date here as well, in order to check for messages in threaded conversations
    age.setDate(age.getDate() - DAYS);
    var total = 0;

    try {
        // Search for mail, but limit to 40 at a time
        var threads = GmailApp.search(search, 0, 40);

        for (var i = 0; i < threads.length; i++) {
            labels = threads[i].getLabels()
            var processed = false;

            // Check for "Keep" label and archive those
            for (var j = 0; j < labels.length; j++) {
              labelName = labels[j].getName()
              if (labelName.includes("Keep")) {
                subject = threads[i].getFirstMessageSubject()
                //console.info(" Archiving message: " + subject)
                threads[i].moveToArchive();
                processed = true;
                continue;
              }
            }

            // TODO: test removing this
            if (processed) {
              continue;
            }

            // Before deleting, check if any message in a thread is newer than the cutoff date
            var messages = GmailApp.getMessagesForThread(threads[i]);
            for (var j = 0; j < messages.length; j++) {
                var email = messages[j];       
                if (email.getDate() > age) {
                    // The conversation is actually newer than the purgeDate, remove it from the deletion queue
                    messages.splice(j, 1)
                    j = j - 1
                }
            }

            // Finally, delete remaining messages
            if (messages.length > 0) {
              subject = threads[i].getFirstMessageSubject()
              var sender=messages[0].getFrom();
              console.info(" Going to delete FROM: " + sender + " SUBJECT: " + subject)
              GmailApp.moveMessagesToTrash(messages)
            }
        }
    } catch (e) { console.info(" [] Error: " + e) }
}

// Archive function archives messages found in a given search string
// No logic is present to prevent archiving special messages
function Archive(search) {
    console.info(search)
    var age = new Date();
    age.setDate(age.getDate() - DAYS);
    var total = 0;

    try {
        // Search for mail, but limit to 40 at a time
        var threads = GmailApp.search(search, 0, 40);
        for (var i = 0; i < threads.length; i++) {
              threads[i].moveToArchive();
            }
    } catch (e) { console.info(" [] Error: " + e) }
}
