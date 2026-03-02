package com.project.chat_app_backend.controller;


import com.project.chat_app_backend.entity.Message;
import com.project.chat_app_backend.entity.Room;
import com.project.chat_app_backend.payload.MessageRequest;
import com.project.chat_app_backend.repositoy.RoomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@CrossOrigin("*")
public class ChatController {
    private final RoomRepo roomRepo;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage( @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ){
        Room room = roomRepo.findByRoomId(request.getRoomId());

        Message message = new Message();
        message.setSender(request.getSender());
        message.setContent(request.getContent());
        message.setTimeStamp(LocalDateTime.now());

        if(room != null){
            room.getMessages().add(message);
            roomRepo.save(room);
        }
        else{
            throw new RuntimeException("Room not found.");
        }

        return message;
    }
}
