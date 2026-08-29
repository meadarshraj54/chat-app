package com.project.chat_app_backend.controller;

import com.project.chat_app_backend.entity.Message;
import com.project.chat_app_backend.entity.Room;
import com.project.chat_app_backend.payload.RoomRequest;
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

    // create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomRequest roomRequest) {
        if (roomRequest == null || roomRequest.getRoomId() == null || roomRequest.getRoomId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }
        if (roomRequest.getPassword() == null || roomRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required to create a room");
        }

        // room exists
        if (roomRepo.findByRoomId(roomRequest.getRoomId()) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }

        // create a new room
        Room room = new Room();
        room.setRoomId(roomRequest.getRoomId());
        room.setPassword(roomRequest.getPassword());
        Room savedRoom = roomRepo.save(room);

        savedRoom.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    // authenticate and join room
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody RoomRequest roomRequest) {
        if (roomRequest == null || roomRequest.getRoomId() == null) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }

        Room room = roomRepo.findByRoomId(roomRequest.getRoomId());
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found.");
        }

        if (room.getPassword() != null && !room.getPassword().equals(roomRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid room password.");
        }

        room.setPassword(null);
        return ResponseEntity.ok(room);
    }

    // get rooms (legacy endpoint fallback)
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found.");
        }
        room.setPassword(null);
        return ResponseEntity.ok(room);
    }

    // get messages in a room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String roomId,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found.");
        }

        if (room.getPassword() != null && !room.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid room password.");
        }

        // fetch all messages
        List<Message> messages = room.getMessages();

        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);

        List<Message> paginatedMessages = messages.subList(start, end);

        return ResponseEntity.ok(paginatedMessages);
    }
}
