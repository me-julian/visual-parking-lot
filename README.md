# Animated Parking Lot Simulation

Note: It takes ~10 minutes for the parking lot to fill up where you can really start to see a lot of the edge cases and car interactions.

## Tech

This simulation is produced client-side purely using vanilla JS scripts in the DOM and CSS. No libraries are used, the code is purely custom.

## Provided Requirements

- Use the provided parking lot layout and cars
- Park 100 cars into the parking lot
- Each car will navigate the parking lot to locate an open spot
- Each car will park in a spot for a random amount of time
- When the car is done parking, it will leave the lot
- Cars will enter the lot on the bottom-left
- Cars will exit the lot on the bottom-right
- No two cars can exist in the same parking spot at the same time
- Cars *shouldn't* exist in the same physical space (corvettes can't drive over each other)
- A car should visually drive around the parking lot towards the free spot
- A car should visually turn to park in a free space

## Features

- Cars will navigate the lot without crashing and using realistic-ish animations, even when making large moves.
- A recursive algorithm determines the shortest path to a location in the lot.
- Animations for parking and turning including edge cases like cars which need to back out of the corners or make a u-turn into their space.
- CSS animations for parking and turning cars are generated using generalized base animation types and calculated values.
- Users can toggle visual indicators to better see how cars navigate the lot, including:
  - Intersection collision boxes and a visual status of whether they're occupied (red is occupied, green is open).
  - The path-lines cars can take through the lot.
  - Highlights on the status of all parking spaces.
    - White: Space is unclaimed and unoccupied.
    - Yellow: Space is claimed by a car.
    - Red: A car is parked in the space.
    - Purple: A car is leaving or wishes to leave the space.
  - Selection of a single car to show:
    - That car's collision box
    - A bounding box showing the current section of the road the car is driving on in purple and the sections it will drive on after in a straight line in pink.
    - That car's parking space status even if space status highlighting is turned off.
    - A bounding box showing the space reserved by the car's animation to park or leave a parking space.
- Running tally on cars which have entered/are in/have left the lot.
- Random color for each car entering the lot.
- Cars respect handicap parking spaces and have a chance to be permitted to use them.
- Cars prefer spaces closer to the top-left corner of the lot, simulating proximity to a business entrance.
- JSDoc documentation for some key classes.

## Problems and Limitations

- Certain parking animations are still floaty/slidy/otherwise unrealistic.
- Cars move at a constant, fairly slow speed except when parking/turning and there's no way to speed up the simulation as the CSS animation speed is currently not configurable.
- Cars do not properly give right-of-way. They will always yield to a car which has reached the beginning of their animation to turn/park first.
- There is no human delay in movement/reaction.
- Due to the way sections of the lot are broken up in code, the pathing algorithm does not always realistically produce the shortest possible path to a location.
- When spawned, cars magically know/are assigned the most desirable space in the lot regardless of if they could realistically see it, and will ignore opportunities that open up for a better one as they drive.
- If you select a car while it's in the middle of an animation won't show that animation's reserved area boxes, making viewing them particularly difficult for unparking animations which happen randomly.
- Messy, untested/untestable, highly coupled code (see below).

## Learn More

This was a difficult project I put a lot of work into with relatively little experience. If you'd like to read about my experience building this project, I wrote about it in my article [How a Junior Dev Can Learn from 40-Year-Old Mistakes](https://www.linkedin.com/pulse/how-junior-dev-can-learn-from-40-year-old-mistakes-julian-edwards-3p2kc)
