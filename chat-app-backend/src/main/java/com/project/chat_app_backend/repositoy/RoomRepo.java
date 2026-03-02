package com.project.chat_app_backend.repositoy;

import com.project.chat_app_backend.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepo extends MongoRepository<Room, String> {

    //get room using id;
    Room findByRoomId(String roomId);
}
