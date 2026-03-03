import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Event = {
    id : Text;
    name : Text;
    startDate : Text;
    endDate : Text;
    participants : Nat;
    purpose : Text;
    venue : Text;
    photoLink : Text;
    organiser : Text;
    poster : Text;
    posterName : Text;
    adminOrder : Text;
    adminOrderName : Text;
    createdAt : Int;
    views : Nat;
  };

  let events = Map.empty<Text, Event>();

  public shared ({ caller }) func addEvent(
    name : Text,
    startDate : Text,
    endDate : Text,
    participants : Nat,
    purpose : Text,
    venue : Text,
    photoLink : Text,
    organiser : Text,
    posterId : Text,
    posterName : Text,
    adminOrderId : Text,
    adminOrderName : Text,
  ) : async Event {
    let id = name.concat(Time.now().toText());
    let event = {
      id;
      name;
      startDate;
      endDate;
      participants;
      purpose;
      venue;
      photoLink;
      organiser;
      poster = posterId;
      posterName;
      adminOrder = adminOrderId;
      adminOrderName;
      createdAt = Time.now();
      views = 0;
    };
    events.add(id, event);
    event;
  };

  public shared ({ caller }) func updateEvent(
    id : Text,
    name : Text,
    startDate : Text,
    endDate : Text,
    participants : Nat,
    purpose : Text,
    venue : Text,
    photoLink : Text,
    organiser : Text,
    posterId : Text,
    posterName : Text,
    adminOrderId : Text,
    adminOrderName : Text,
  ) : async ?Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Update event error: Event not found!") };
      case (?existingEvent) {
        let updatedEvent = {
          id;
          name;
          startDate;
          endDate;
          participants;
          purpose;
          venue;
          photoLink;
          organiser;
          poster = posterId;
          posterName;
          adminOrder = adminOrderId;
          adminOrderName;
          createdAt = existingEvent.createdAt;
          views = existingEvent.views;
        };
        events.add(id, updatedEvent);
        ?updatedEvent;
      };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async Bool {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Delete event error: Event not found!") };
      case (?event) {
        events.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getEvents() : async [Event] {
    events.values().toArray();
  };

  public shared ({ caller }) func recordView(id : Text) : async ?Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Record view error: Event not found!") };
      case (?event) {
        let updatedEvent = { event with views = event.views + 1 };
        events.add(id, updatedEvent);
        ?updatedEvent;
      };
    };
  };
};
