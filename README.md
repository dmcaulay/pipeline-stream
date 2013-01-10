# Pipeline Stream

Node.js streams for data pipelines. Inspired by the Node.js `Stream` class

there is no concept of pause, resume, end or close. i've decided to remove them because i think they complicate the node.js stream class and they aren't necessary for a data pipeline.

```
basic stream layout
s - source
q - queue
m - mddleware
s->q->m->q->m->...
```
streams emit data when sending down the pipe and emit drain when they are ready for more data. lets go over how this works for all 3 of the types.

#source:
the source stream reads data and emits it when the onDrain method is called. it should emit the first data event when it's created. the stream doesn't need to emit drain because there is no one upstream.

#queue:
you'll see that the queue is its own stream. i prefer this because it keeps the logic out of the middleware streams and makes it easy to move the queue out of memory to something like sqs or redis. queues receive data, but only emit data after their onDrain method is called. there is one exception to this rule and that's at startup. we assume that the downstream stream can handle the first chunk of data before it calls drain.

#middleware:
this is where everything interesting happens. most appication developers will only write middleware streams. they receive data, do their job and emit new data to the downstream stream. they are also responsible for calling drain when they're done with the data.

#events:
```
'data'  - emitted to send data down the pipe
'drain' - emitted to indicate the stream is done processing data
'error' - emitted to indicate something went wrong while processing this chunk of data. as a 
          convenience, when you pipe one stream to another stream we add a listener on the 
          error event that automatically calls drain so the upstream queue knows to send more data.
'next'  - emitted to send data and emit the drain event
'noop'  - emitted to indicate the streram is ignoring this data and not sending it down the pipe
```

#options:
```
name:     the name of the stream
max:      the max number of items to process in parallel
debug:    an object used to report data, error, noop events when debugging your pipeline
```

#methods:
```
pipe:       same as node.js
getStats:   get an object containing the current stats
resetStats: reset the stats
```

#compatibility:
#####doesn't this break compatibility with all the other streams out there?
yes it does, but combatibility can easily be restored by adding a queue that listens to the control flow logic of node.js
#####isn't node.js releasing a new and simpler version anyways?
the answer is yes, but i still don't like the control flow built into the stream class. i think it's too complex and adds more state than i really want to deal with. id rather keep my middleware streams simpler and have all the control flow handled in separate streams. plus, it's just a fun topic to explore.
