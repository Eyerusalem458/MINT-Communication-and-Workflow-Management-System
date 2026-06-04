import 'dart:js_interop';
import 'dart:html' as html;
import 'dart:typed_data';

Future<Uint8List> fetchBlobAsBytes(String path) async {
  final jsResponse = await html.window.fetch(path);
  final jsBlob = await jsResponse.blob();
  final jsArrayBuffer = await jsBlob.arrayBuffer();
  return Uint8List.view(jsArrayBuffer.toDart.buffer);
}
