package com.project.chat_app_backend.controller;

import com.project.chat_app_backend.entity.Message;
import com.project.chat_app_backend.entity.Room;
import com.project.chat_app_backend.repositoy.RoomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RoomController {

    private final RoomRepo roomRepo;

    //create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        //room exists
        if(roomRepo.findByRoomId(roomId) != null){
            return ResponseEntity.badRequest().body("Room already exists");
        }

        //create a new room
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepo.save(room);

        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    //get rooms
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        Room room = roomRepo.findByRoomId(roomId);
        if(room == null){
            return ResponseEntity.badRequest().body("Room not found.");
        }
        return ResponseEntity.ok(room);
    }


    //get messages in a room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
                                                     @RequestParam(value = "page", defaultValue = "0", required = false) int page,
                                                     @RequestParam(value = "size", defaultValue = "20", required = false) int size)
    {
        Room room = roomRepo.findByRoomId(roomId);
        if(room == null){
            return ResponseEntity.badRequest().build();
        }
        //fetch all messages
        List<Message> messages = room.getMessages();

        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);

        List<Message> paginatedMessages = messages.subList(start, end);

        return ResponseEntity.ok(paginatedMessages);
    }
}
