function formatEventObject(res){
  console.log("yo")
  console.log("INFO PASSED TO THE FUNCTION IS: ", res)

  var formattedEvents = {}
  var size = -1 

  for(var i = 0; i<15; i++){
    var event = {
    event_name: res["events"][i]["name"]["text"],
    start_time: res["events"][i]["start"]["local"],
    end_time: res["events"][i]["end"]["local"],
    ticket_url: res["events"][i]["url"],
    id: res["events"][i]["id"],
    tags: ["hippo", "campus"],
    image_url: res["events"][i]["logo"]["url"]
  }
    formattedEvents[size+1]= event  
    size = Object.keys(formattedEvents).length
  }

 // console.log("The result is: ", formattedEvents)
  return formattedEvents
}