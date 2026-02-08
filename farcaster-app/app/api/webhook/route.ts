import {
    ParseWebhookEvent,
    parseWebhookEvent,
    verifyAppKeyWithNeynar,
  } from "@farcaster/miniapp-node";
  import { NextRequest } from "next/server";
  import {
    deleteUserNotificationDetails,
    setUserNotificationDetails,
  } from "@/lib/kv";
  import { sendFrameNotification } from "@/lib/notifs";
  
  export async function POST(request: NextRequest) {
    const requestJson = await request.json();
  
    let data;
    try {
      data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    } catch (e: unknown) {
      const error = e as ParseWebhookEvent.ErrorType;
  
      switch (error.name) {
        case "VerifyJsonFarcasterSignature.InvalidDataError":
        case "VerifyJsonFarcasterSignature.InvalidEventDataError":
          return Response.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
          return Response.json(
            { success: false, error: error.message },
            { status: 401 }
          );
        case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
          return Response.json(
            { success: false, error: error.message },
            { status: 500 }
          );
      }
    }
  
    if (!data) {
      return Response.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    const fid = data.fid;
    const event = data.event;
  
    switch (event.event) {
      case "miniapp_added":
        if (event.notificationDetails) {
          await setUserNotificationDetails(fid, event.notificationDetails);
          await sendFrameNotification({
            fid,
            title: "Welcome to BlitzBoard! ⚡",
            body: "You can now vote on hackathon submissions with quadratic voting on Monad.",
          });
        } else {
          await deleteUserNotificationDetails(fid);
        }
  
        break;
      case "miniapp_removed":
        await deleteUserNotificationDetails(fid);
  
        break;
      case "notifications_enabled":
        await setUserNotificationDetails(fid, event.notificationDetails);
        await sendFrameNotification({
          fid,
          title: "Notifications Enabled 🔔",
          body: "You'll be notified about new events and voting results.",
        });
  
        break;
      case "notifications_disabled":
        await deleteUserNotificationDetails(fid);
  
        break;
    }
  
    return Response.json({ success: true });
  }
