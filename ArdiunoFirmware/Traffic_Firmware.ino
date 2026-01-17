// --- TRAFFIC GUARD ULTRA V6 FIRMWARE ---

// Pin Definitions (Modify as per your wiring)
// NORTH
const int N_RED = 2;
const int N_YELLOW = 3;
const int N_GREEN = 4;

// EAST
const int E_RED = 5;
const int E_YELLOW = 6;
const int E_GREEN = 7;

// SOUTH
const int S_RED = 8;
const int S_YELLOW = 9;
const int S_GREEN = 10;

// WEST
const int W_RED = 11;
const int W_YELLOW = 12;
const int W_GREEN = 13; // Note: Pin 13 LED might blink on boot

String inputString = "";
boolean stringComplete = false;

void setup()
{
    Serial.begin(9600);

    // Setup Pins
    for (int i = 2; i <= 13; i++)
    {
        pinMode(i, OUTPUT);
        digitalWrite(i, LOW); // Start All Off
    }

    Serial.println("ARDUINO READY");
    setAllRed();
}

void loop()
{
    if (stringComplete)
    {
        parseCommand(inputString);
        inputString = "";
        stringComplete = false;
    }
}

// Read Data from Serial (Node.js)
void serialEvent()
{
    while (Serial.available())
    {
        char inChar = (char)Serial.read();
        inputString += inChar;
        if (inChar == '\n')
        {
            stringComplete = true;
        }
    }
}

void parseCommand(String cmd)
{
    cmd.trim(); // Remove whitespace

    // Logic: "DIRECTION:STATE" ex: "north:GREEN"

    if (cmd == "EMERGENCY")
    {
        setAllRed();
        return;
    }

    int separatorIndex = cmd.indexOf(':');
    if (separatorIndex == -1)
        return;

    String dir = cmd.substring(0, separatorIndex);
    String state = cmd.substring(separatorIndex + 1);

    updateLights(dir, state);
}

void updateLights(String activeDir, String state)
{
    // First, set everyone to RED (Base state)
    // Optimization: In real life, don't flicker. But for logic safety:

    // North Logic
    setLaneLights(N_RED, N_YELLOW, N_GREEN, activeDir == "north" ? state : "RED");

    // East Logic
    setLaneLights(E_RED, E_YELLOW, E_GREEN, activeDir == "east" ? state : "RED");

    // South Logic
    setLaneLights(S_RED, S_YELLOW, S_GREEN, activeDir == "south" ? state : "RED");

    // West Logic
    setLaneLights(W_RED, W_YELLOW, W_GREEN, activeDir == "west" ? state : "RED");
}

void setLaneLights(int pinRed, int pinYellow, int pinGreen, String state)
{
    if (state == "GREEN")
    {
        digitalWrite(pinRed, LOW);
        digitalWrite(pinYellow, LOW);
        digitalWrite(pinGreen, HIGH);
    }
    else if (state == "YELLOW")
    {
        digitalWrite(pinRed, LOW);
        digitalWrite(pinYellow, HIGH);
        digitalWrite(pinGreen, LOW);
    }
    else
    {
        // RED
        digitalWrite(pinRed, HIGH);
        digitalWrite(pinYellow, LOW);
        digitalWrite(pinGreen, LOW);
    }
}

void setAllRed()
{
    // Turn all RED ON, others OFF
    setLaneLights(N_RED, N_YELLOW, N_GREEN, "RED");
    setLaneLights(E_RED, E_YELLOW, E_GREEN, "RED");
    setLaneLights(S_RED, S_YELLOW, S_GREEN, "RED");
    setLaneLights(W_RED, W_YELLOW, W_GREEN, "RED");
}