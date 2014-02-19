using System;
using System.Collections;
using System.Collections.Generic;
using BackboneTemplate;

namespace Pnw.Admin.Utils
{
    public class FlashMessages : IEnumerable<KeyValuePair<string, string>>
    {
        public const string Key = "__Flash";

        private readonly IDictionary<string, object> _backingStore;

        public FlashMessages(IDictionary<string, object> backingStore)
        {
            _backingStore = backingStore;
        }

        public string this[FlashMessageType type]
        {
            get { return this[type.ToString()]; }

            set { this[type.ToString()] = value; }
        }

        public string this[string type]
        {
            get { return GetMessage(type); }

            set { SetMessage(type, value); }
        }

        public virtual IEnumerator<KeyValuePair<string, string>> GetEnumerator()
        {
            object messages;

            if (!_backingStore.TryGetValue(Key, out messages))
            {
                yield break;
            }

            foreach (var item in (List<MessageItem>)messages)
            {
                yield return new KeyValuePair<string, string>(
                    item.Type, item.Message);
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        protected virtual string GetMessage(string type)
        {
            object temp;

            if (!_backingStore.TryGetValue(Key, out temp))
            {
                return null;
            }

            var messages = (List<MessageItem>)temp;
            var item = messages.Find(m => m.Type.Equals(
                type, StringComparison.OrdinalIgnoreCase));

            return item == null ? null : item.Message;
        }

        protected virtual void SetMessage(string type, string message)
        {
            var messages = new List<MessageItem>();
            object temp;

            if (!_backingStore.TryGetValue(Key, out temp))
            {
                _backingStore.Add(Key, messages);
            }
            else
            {
                messages = (List<MessageItem>)temp;
            }

            var item = messages.Find(m => m.Type.Equals(
                type, StringComparison.OrdinalIgnoreCase));

            if (item == null)
            {
                if (!string.IsNullOrWhiteSpace(message))
                {
                    messages.Add(new MessageItem
                        {
                            Type = type,
                            Message = message
                        });
                }

                return;
            }

            if (message == null)
            {
                messages.Remove(item);
            }
            else
            {
                item.Message = message;
            }
        }

        [Serializable]
        private sealed class MessageItem
        {
            public string Type { get; set; }

            public string Message { get; set; }
        }
    }
}