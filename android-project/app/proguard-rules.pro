# ProGuard rules for SmartPay Sound Box
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* *;
}
-dontwarn java.lang.instrument.**
