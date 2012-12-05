# Pipeline Stream

Node.js streams for data pipelines. Inspired by the Node.js `Stream` class

there is no concept of pause, resume, end or close i've decided to remove them because i think they complicate the node.js stream class

```
basic stream layout
s - source
q - queue
m - mddleware

s->q->m->q->m->...
```
